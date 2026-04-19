from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import GuidanceSession
from .serializers import GuidanceSessionSerializer
from products.models import Product
from products.serializers import ProductSerializer


class GuidanceViewSet(viewsets.ModelViewSet):
    serializer_class = GuidanceSessionSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def get_recommendations(self, request):
        goal = request.data.get('goal', '')
        experience = request.data.get('experience', '')
        dietary_preference = request.data.get('dietary_preference', '')
        budget = request.data.get('budget', '')

        session = GuidanceSession.objects.create(
            goal=goal,
            experience=experience,
            dietary_preference=dietary_preference,
            budget=budget,
            user=request.user if request.user.is_authenticated else None
        )

        scored_products = []
        for product in Product.objects.all():
            score = 0
            reasons = []

            if goal and goal in (product.goal_tags or ''):
                score += 4
                reasons.append(f'matches your {goal.replace("_", " ")} goal')
            if experience and experience in (product.experience_level or ''):
                score += 2
                reasons.append(f'suits {experience} users')
            if dietary_preference and dietary_preference in (product.dietary_preference or ''):
                score += 2
                reasons.append(f'fits a {dietary_preference} diet')
            if budget and budget in (product.price_range or ''):
                score += 2
                reasons.append(f'fits your {budget} budget')
            if product.stock > 0:
                score += 1

            if score > 0:
                scored_products.append((score, product, reasons))

        scored_products.sort(key=lambda item: (-item[0], item[1].price))
        top_products = [item[1] for item in scored_products[:10]]
        serializer = ProductSerializer(top_products, many=True)

        explanations = [
            {
                'product_id': product.id,
                'score': score,
                'why_recommended': reasons or ['general fit for your answers']
            }
            for score, product, reasons in scored_products[:10]
        ]

        summary = (
            f"Recommended for a {experience} user targeting {goal.replace('_', ' ')} "
            f"with a {dietary_preference} diet and {budget} budget."
        )

        return Response({
            'session': GuidanceSessionSerializer(session).data,
            'summary': summary,
            'recommendations': serializer.data,
            'explanations': explanations,
        }, status=status.HTTP_201_CREATED)
