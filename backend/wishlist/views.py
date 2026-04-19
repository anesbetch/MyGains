from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import WishlistItem
from products.serializers import ProductSerializer


class WishlistViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def get_wishlist(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related('product__category')
        products = [item.product for item in items]
        return Response(ProductSerializer(products, many=True).data)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id required'}, status=400)
        item, created = WishlistItem.objects.get_or_create(user=request.user, product_id=product_id)
        if not created:
            item.delete()
            return Response({'wishlisted': False})
        return Response({'wishlisted': True})

    @action(detail=False, methods=['get'])
    def check(self, request):
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({'error': 'product_id required'}, status=400)
        wishlisted = WishlistItem.objects.filter(user=request.user, product_id=product_id).exists()
        return Response({'wishlisted': wishlisted})
