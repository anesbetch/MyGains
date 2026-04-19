import os
import re
from difflib import SequenceMatcher

import requests
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from products.models import Product
from .models import ChatMessage, ChatSettings, CustomQAPair, ExternalKnowledgeItem
from .serializers import ChatMessageSerializer, ChatSettingsSerializer


GOAL_ALIASES = {
    'muscle': ['muscle', 'muscle gain', 'gain muscle', 'bulk', 'bulking', 'build muscle', 'mass'],
    'fat_loss': ['fat loss', 'lose fat', 'weight loss', 'lose weight', 'cut', 'cutting', 'slim'],
    'general': ['fitness', 'general', 'health', 'wellness', 'stay fit', 'maintenance'],
}

DIET_ALIASES = {
    'vegan': ['vegan', 'plant based', 'plant-based'],
    'vegetarian': ['vegetarian'],
    'omnivore': ['omnivore', 'regular diet', 'no diet restriction', 'eat everything'],
}

BUDGET_ALIASES = {
    'budget': ['budget', 'cheap', 'low budget', 'affordable', 'low cost', 'inexpensive'],
    'mid': ['mid', 'medium budget', 'moderate', 'mid range', 'mid-range'],
    'premium': ['premium', 'high budget', 'expensive', 'top quality', 'high-end'],
}

PRODUCT_KEYWORDS = {
    'protein': ['protein', 'whey', 'casein', 'isolate'],
    'supplement': ['supplement', 'vitamin', 'creatine', 'pre workout', 'pre-workout', 'bcaa'],
    'accessory': ['shaker', 'belt', 'gloves', 'bottle', 'bag', 'accessory'],
    'clothing': ['shirt', 'hoodie', 'shorts', 'leggings', 'clothing', 'wear', 'apparel'],
}

QUESTION_HINTS = [
    'recommend', 'suggest', 'best', 'what should i buy', 'which product', 'which protein',
    'goal', 'diet', 'budget', 'beginner', 'muscle', 'fat loss', 'weight loss'
]


class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [AllowAny]
    queryset = ChatMessage.objects.all()

    @action(detail=False, methods=['post'])
    def send_message(self, request):
        user_message = request.data.get('message', '').strip()

        if not user_message:
            return Response({'error': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)

        ai_response, response_source, matched_question = self.get_ai_response(user_message)

        chat_msg = ChatMessage.objects.create(
            user=request.user if request.user.is_authenticated else None,
            message=user_message,
            response=ai_response,
            response_source=response_source,
            matched_question=matched_question,
        )

        serializer = self.get_serializer(chat_msg)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def chat_config(self, request):
        settings_obj = ChatSettings.get_solo()
        data = ChatSettingsSerializer(settings_obj).data
        data['assistant_purpose'] = (
            'Real-time help to choose the right fitness products with confidence.'
            ''
        )
        data['prompt_hint'] = 'Tell me your goal, diet, and budget for a smarter suggestion.'
        return Response(data)

    def get_ai_response(self, user_message):
        settings_obj = ChatSettings.get_solo()

        if settings_obj.prioritize_custom_qa:
            custom_match = self.match_custom_qa(user_message, priority_only=True)
            if custom_match:
                return custom_match

        smart_match = self.get_smart_recommendation_response(user_message)
        if smart_match:
            return smart_match

        if settings_obj.use_external_api:
            external_match = self.fetch_external_answer(user_message, settings_obj)
            if external_match:
                return external_match

        openai_match = self.get_openai_response(user_message)
        if openai_match:
            return openai_match

        if not settings_obj.prioritize_custom_qa:
            custom_match = self.match_custom_qa(user_message, priority_only=False)
            if custom_match:
                return custom_match

        return self.get_rule_based_response(user_message), 'rule_based', ''

    def match_custom_qa(self, message, priority_only=False):
        message_lower = message.lower().strip()
        candidates = CustomQAPair.objects.filter(is_active=True).order_by('priority', '-updated_at')
        if priority_only:
            candidates = candidates.filter(use_as_priority_answer=True)
        best_match = None
        best_score = 0.0

        for qa in candidates:
            question_lower = qa.question.lower().strip()
            keywords = qa.keyword_list()
            score = 0.0

            if qa.match_type == 'exact' and message_lower == question_lower:
                score = 1.0
            else:
                similarity = SequenceMatcher(None, message_lower, question_lower).ratio()
                keyword_hits = sum(1 for keyword in keywords if keyword in message_lower)
                keyword_bonus = min(0.4, keyword_hits * 0.15)
                contains_bonus = 0.2 if question_lower in message_lower or message_lower in question_lower else 0
                score = similarity + keyword_bonus + contains_bonus

            if score > best_score:
                best_score = score
                best_match = qa

        if best_match and best_score >= 0.62:
            return best_match.answer, 'custom_qa', best_match.question
        return None

    def get_smart_recommendation_response(self, message):
        preferences = self.extract_preferences(message)
        wants_recommendation = self.looks_like_recommendation_request(message, preferences)
        if not wants_recommendation:
            return None

        missing = [
            label for key, label in [('goal', 'goal'), ('dietary_preference', 'diet'), ('budget', 'budget')]
            if not preferences.get(key)
        ]
        if missing:
            return (
                'I can give a smarter product suggestion. Please tell me your '
                + ', '.join(missing[:-1] + ([f'and {missing[-1]}'] if missing else []))
                + '. Example: "My goal is muscle gain, I am vegan, and my budget is budget."',
                'smart_recommendation',
                'missing_preferences',
            )

        ranked = self.rank_products(preferences)
        if not ranked:
            return (
                'I could not find an exact product match yet, but I can still help. Try telling me your exact goal, diet, '
                'budget, and whether you want supplements, protein, clothing, or accessories.',
                'smart_recommendation',
                'no_product_match',
            )

        top_items = ranked[:3]
        lines = [
            'Here are smart recommendations based on your needs:',
        ]
        for index, item in enumerate(top_items, start=1):
            product = item['product']
            reason_text = '; '.join(item['reasons'][:3]) or 'good overall fit'
            lines.append(f'{index}. {product.name} - ${product.price} ({reason_text}).')

        summary = (
            f"Your profile: goal = {preferences['goal'].replace('_', ' ')}, "
            f"diet = {preferences['dietary_preference']}, budget = {preferences['budget']}"
        )
        follow_up = 'If you want, I can also narrow this down to protein, supplements, clothing, or accessories.'
        return '\n'.join(lines + [summary, follow_up]), 'smart_recommendation', 'product_match'

    def looks_like_recommendation_request(self, message, preferences):
        message_lower = message.lower()
        if any(hint in message_lower for hint in QUESTION_HINTS):
            return True
        return any(preferences.values())

    def extract_preferences(self, message):
        message_lower = message.lower()
        preferences = {
            'goal': self.find_alias_value(message_lower, GOAL_ALIASES),
            'dietary_preference': self.find_alias_value(message_lower, DIET_ALIASES),
            'budget': self.find_alias_value(message_lower, BUDGET_ALIASES),
            'experience': self.find_experience(message_lower),
            'product_focus': self.find_product_focus(message_lower),
        }
        return preferences

    def find_alias_value(self, message, alias_map):
        for canonical, aliases in alias_map.items():
            if canonical in message:
                return canonical
            if any(alias in message for alias in aliases):
                return canonical
        return ''

    def find_experience(self, message):
        if 'beginner' in message or 'new to gym' in message or 'just started' in message:
            return 'beginner'
        if 'advanced' in message or 'experienced' in message:
            return 'advanced'
        if 'intermediate' in message:
            return 'intermediate'
        return ''

    def find_product_focus(self, message):
        for product_type, keywords in PRODUCT_KEYWORDS.items():
            if any(keyword in message for keyword in keywords):
                return product_type
        return ''

    def rank_products(self, preferences):
        ranked = []
        queryset = Product.objects.filter(stock__gt=0)
        for product in queryset:
            score = 0
            reasons = []

            if preferences['goal'] and preferences['goal'] in (product.goal_tags or '').lower():
                score += 5
                reasons.append(f'matches your {preferences["goal"].replace("_", " ")} goal')
            if preferences['dietary_preference'] and preferences['dietary_preference'] in (product.dietary_preference or '').lower():
                score += 4
                reasons.append(f'fits a {preferences["dietary_preference"]} diet')
            if preferences['budget'] and preferences['budget'] in (product.price_range or '').lower():
                score += 3
                reasons.append(f'fits your {preferences["budget"]} budget')
            if preferences['experience'] and preferences['experience'] in (product.experience_level or '').lower():
                score += 2
                reasons.append(f'suits {preferences["experience"]} users')
            if preferences['product_focus']:
                product_text = f"{product.name} {product.description} {product.category.name}".lower()
                if preferences['product_focus'] in product_text:
                    score += 2
                    reasons.append(f'aligned with your {preferences["product_focus"]} interest')
                elif any(keyword in product_text for keyword in PRODUCT_KEYWORDS.get(preferences['product_focus'], [])):
                    score += 2
                    reasons.append(f'matches your requested product type')
            if product.stock > 0:
                score += 1
                reasons.append('currently in stock')

            if score > 0:
                ranked.append({'product': product, 'score': score, 'reasons': reasons})

        ranked.sort(key=lambda item: (-item['score'], item['product'].price, item['product'].name))
        return ranked

    def fetch_external_answer(self, message, settings_obj):
        local_match = self.match_external_knowledge(message)
        if local_match:
            return local_match

        if not settings_obj.external_api_url:
            return None

        headers = {'Accept': 'application/json'}
        if settings_obj.external_api_key:
            headers['Authorization'] = f'Bearer {settings_obj.external_api_key}'

        try:
            response = requests.get(
                settings_obj.external_api_url,
                params={'q': message},
                headers=headers,
                timeout=settings_obj.external_api_timeout,
            )
            response.raise_for_status()
            payload = response.json()
        except Exception:
            return None

        if isinstance(payload, dict):
            if payload.get('answer'):
                return payload['answer'], 'external_api', payload.get('question', '')
            items = payload.get('items') or payload.get('data') or []
        elif isinstance(payload, list):
            items = payload
        else:
            items = []

        self.sync_external_items(items)
        return self.match_external_knowledge(message)

    def sync_external_items(self, items):
        if not isinstance(items, list):
            return
        for item in items[:100]:
            if not isinstance(item, dict):
                continue
            question = (item.get('question') or item.get('title') or '').strip()
            answer = (item.get('answer') or item.get('content') or item.get('description') or '').strip()
            if not question or not answer:
                continue
            ExternalKnowledgeItem.objects.update_or_create(
                question=question,
                defaults={
                    'answer': answer,
                    'source_label': item.get('source_label', 'External API'),
                    'is_active': True,
                }
            )

    def match_external_knowledge(self, message):
        message_lower = message.lower().strip()
        best_item = None
        best_score = 0.0
        for item in ExternalKnowledgeItem.objects.filter(is_active=True):
            question_lower = item.question.lower().strip()
            score = SequenceMatcher(None, message_lower, question_lower).ratio()
            if question_lower in message_lower or message_lower in question_lower:
                score += 0.2
            if score > best_score:
                best_score = score
                best_item = item
        if best_item and best_score >= 0.65:
            return best_item.answer, 'external_api', best_item.question
        return None

    def get_openai_response(self, user_message):
        try:
            from openai import OpenAI
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                return None
            client = OpenAI(api_key=api_key)
            qa_pairs = list(CustomQAPair.objects.filter(is_active=True).order_by('priority')[:10])
            product_names = ', '.join(Product.objects.values_list('name', flat=True)[:8]) or 'our fitness catalog'
            qa_context = '\n'.join([f"Q: {qa.question}\nA: {qa.answer}" for qa in qa_pairs]) or 'No custom FAQs available.'
            response = client.chat.completions.create(
                model='gpt-4.1-mini',
                messages=[
                    {
                        'role': 'system',
                        'content': (
                            'You are a helpful fitness ecommerce assistant. Answer automatically, stay concise, '
                            'help users choose the right products, answer questions about supplements, protein types, '
                            'and gym products, and make shopping easy, smart, and beginner-friendly. '
                            'When recommendation details are missing, ask for goal, diet, and budget. '
                            'Use the store context when relevant, prefer the admin-defined FAQ context below when it helps, '
                            'and remind customers to consult professionals for medical advice.\n\n'
                            f'Products: {product_names}\n\nAdmin FAQ context:\n{qa_context}'
                        )
                    },
                    {'role': 'user', 'content': user_message}
                ],
                max_tokens=260
            )
            return response.choices[0].message.content, 'openai', ''
        except Exception:
            return None

    def get_rule_based_response(self, message):
        message_lower = message.lower()
        products = list(Product.objects.all()[:5])
        product_names = ', '.join(p.name for p in products) if products else 'our featured fitness products'

        if 'whey' in message_lower:
            return 'Whey protein is commonly used for muscle recovery and growth because it digests quickly. Tell me your goal, diet, and budget for a better whey suggestion.'
        if 'vegan protein' in message_lower or ('vegan' in message_lower and 'protein' in message_lower):
            return 'For vegan users, plant-based protein is usually the best fit. Tell me your budget and goal, and I can narrow down the best option.'
        if 'protein' in message_lower:
            return f'Protein can support recovery and muscle growth. Popular options in this store include {product_names}. Tell me your goal, diet, and budget for a smarter suggestion.'
        if 'muscle' in message_lower or 'build' in message_lower:
            return 'For muscle gain, look for high-protein supplements, progressive training, and recovery support. Tell me your diet and budget and I will suggest a better-fit product.'
        if 'fat' in message_lower or 'weight' in message_lower or 'lose' in message_lower:
            return 'For fat loss, focus on a calorie-controlled diet, strength training, and consistency. Tell me your diet and budget so I can recommend suitable products.'
        if 'beginner' in message_lower:
            return 'For beginners, start simple: protein, a shaker bottle, and basic training accessories. Tell me your goal, diet, and budget for a beginner-friendly shortlist.'
        if 'recommend' in message_lower or 'suggest' in message_lower:
            return f'I can recommend products from {product_names}. Tell me your goal, diet, and budget for a smarter suggestion.'
        return 'I can help with supplements, protein types, gym accessories, and smart recommendations. Tell me your goal, diet, and budget for a smarter suggestion.'
