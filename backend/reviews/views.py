from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'])
    def get_reviews(self, request):
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({'error': 'product_id required'}, status=400)
        reviews = Review.objects.filter(product_id=product_id).select_related('user')
        serializer = ReviewSerializer(reviews, many=True)
        # compute average
        avg = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0
        return Response({'reviews': serializer.data, 'average': avg, 'count': len(reviews)})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request):
        product_id = request.data.get('product_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')
        if not product_id or not rating:
            return Response({'error': 'product_id and rating are required'}, status=400)
        review, created = Review.objects.update_or_create(
            user=request.user,
            product_id=product_id,
            defaults={'rating': int(rating), 'comment': comment}
        )
        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_review(self, request):
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({'error': 'product_id required'}, status=400)
        try:
            review = Review.objects.get(user=request.user, product_id=product_id)
            return Response(ReviewSerializer(review).data)
        except Review.DoesNotExist:
            return Response(None)
