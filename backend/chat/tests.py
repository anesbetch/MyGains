from django.test import TestCase
from rest_framework.test import APIClient

from chat.models import ChatSettings, CustomQAPair, ExternalKnowledgeItem
from products.models import Category, Product


class ChatFeatureTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        category = Category.objects.create(name='Supplements')
        Product.objects.create(
            name='Whey Protein',
            category=category,
            description='Protein powder for recovery and muscle support',
            price=29.99,
            benefits='Recovery support',
            goal_tags='muscle',
            experience_level='beginner',
            dietary_preference='omnivore',
            price_range='budget',
            stock=10,
        )
        Product.objects.create(
            name='Vegan Protein',
            category=category,
            description='Plant based protein powder',
            price=34.99,
            benefits='Plant protein support',
            goal_tags='muscle,general',
            experience_level='beginner',
            dietary_preference='vegan',
            price_range='mid',
            stock=10,
        )

    def test_custom_qa_is_used_when_prioritised(self):
        ChatSettings.get_solo()
        CustomQAPair.objects.create(
            question='What is your return policy?',
            answer='You can return unopened items within 14 days.',
            keywords='return,refund',
            priority=1,
            use_as_priority_answer=True,
        )

        response = self.client.post('/api/chat/send_message/', {'message': 'Can I get a refund or return my order?'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['response_source'], 'custom_qa')
        self.assertIn('14 days', response.data['response'])

    def test_external_knowledge_can_answer_when_enabled(self):
        settings_obj = ChatSettings.get_solo()
        settings_obj.use_external_api = True
        settings_obj.save()
        ExternalKnowledgeItem.objects.create(
            question='How long does delivery take?',
            answer='Standard delivery usually takes 3 to 5 working days.',
            source_label='Mock API',
        )

        response = self.client.post('/api/chat/send_message/', {'message': 'How long does delivery take?'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['response_source'], 'external_api')
        self.assertIn('3 to 5 working days', response.data['response'])

    def test_settings_endpoint_returns_chat_configuration(self):
        ChatSettings.get_solo()
        response = self.client.get('/api/chat/chat_config/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('prioritize_custom_qa', response.data)
        self.assertIn('assistant_purpose', response.data)

    def test_smart_recommendation_asks_for_missing_details(self):
        ChatSettings.get_solo()
        response = self.client.post('/api/chat/send_message/', {'message': 'Recommend a protein for me'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['response_source'], 'smart_recommendation')
        self.assertIn('goal', response.data['response'].lower())
        self.assertIn('diet', response.data['response'].lower())
        self.assertIn('budget', response.data['response'].lower())

    def test_smart_recommendation_returns_products_when_preferences_exist(self):
        ChatSettings.get_solo()
        response = self.client.post(
            '/api/chat/send_message/',
            {'message': 'My goal is muscle gain, I am vegan, and my budget is mid. Which protein is best?'},
            format='json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['response_source'], 'smart_recommendation')
        self.assertIn('Vegan Protein', response.data['response'])
