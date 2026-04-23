import os
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import CartItem
import requests as http_requests

User = get_user_model()


def _send_order_confirmation_email(user, order):
    api_key = os.getenv('RESEND_API_KEY', '')
    if not api_key:
        return
    try:
        items = order.items.select_related('product').all()
        items_html = ''.join([
            f'<tr><td style="padding:8px;border-bottom:1px solid #eee;">{item.product.name}</td>'
            f'<td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">{item.quantity}</td>'
            f'<td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${item.price}</td></tr>'
            for item in items
        ])
        name = user.first_name or user.email.split('@')[0]
        html = f'''
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;">
          <h2 style="color:#1a3c34;">Order Confirmed! 🎉</h2>
          <p>Hi {name}, thank you for your order. Here's your summary:</p>
          <p><strong>Order #:</strong> {order.id}<br>
             <strong>Status:</strong> Confirmed<br>
             <strong>Shipping to:</strong> {order.shipping_address}, {order.shipping_city}, {order.shipping_country}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:8px;text-align:left;">Product</th>
                <th style="padding:8px;text-align:center;">Qty</th>
                <th style="padding:8px;text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>{items_html}</tbody>
          </table>
          <p style="font-size:1.1rem;"><strong>Total: ${order.total_price}</strong></p>
          <a href="https://mygains.it.com/orders" style="display:inline-block;background:#40916c;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
            View My Orders
          </a>
          <p style="color:#888;font-size:0.85rem;">Thank you for shopping with MyGains 💪</p>
        </div>
        '''
        http_requests.post(
            'https://api.resend.com/emails',
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={
                'from': 'MyGains <noreply@mygains.it.com>',
                'to': [user.email],
                'subject': f'Order #{order.id} Confirmed — MyGains',
                'html': html,
            },
            timeout=8,
        )
    except Exception:
        pass


DISCOUNT_CODES = {
    'FIT10': Decimal('0.10'),
    'WELCOME5': Decimal('0.05'),
    'MUSCLE15': Decimal('0.15'),
}


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')

    @action(detail=False, methods=['get'])
    def get_orders(self, request):
        orders = self.get_queryset()
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        cart_items = CartItem.objects.filter(user=request.user).select_related('product')
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        missing_fields = [
            field for field in ['shipping_address', 'shipping_city', 'shipping_postal_code', 'shipping_country', 'payment_token']
            if not request.data.get(field)
        ]
        if missing_fields:
            return Response({'error': f"Missing required fields: {', '.join(missing_fields)}"}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = Decimal('0.00')
        for item in cart_items:
            if item.quantity > item.product.stock:
                return Response({'error': f'Insufficient stock for {item.product.name}'}, status=status.HTTP_400_BAD_REQUEST)
            subtotal += item.product.price * item.quantity

        discount_code = (request.data.get('discount_code') or '').strip().upper()
        discount_rate = DISCOUNT_CODES.get(discount_code, Decimal('0.00'))
        total = subtotal * (Decimal('1.00') - discount_rate)

        order = Order.objects.create(
            user=request.user,
            shipping_address=request.data.get('shipping_address'),
            shipping_city=request.data.get('shipping_city'),
            shipping_postal_code=request.data.get('shipping_postal_code'),
            shipping_country=request.data.get('shipping_country'),
            payment_token=request.data.get('payment_token'),
            total_price=total.quantize(Decimal('0.01')),
            status='confirmed'
        )

        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            cart_item.product.stock = max(0, cart_item.product.stock - cart_item.quantity)
            cart_item.product.save(update_fields=['stock'])

        request.user.saved_payment_token = request.data.get('payment_token')
        if not request.user.address:
            request.user.address = request.data.get('shipping_address', '')
            request.user.city = request.data.get('shipping_city', '')
            request.user.postal_code = request.data.get('shipping_postal_code', '')
            request.user.country = request.data.get('shipping_country', '')
        request.user.save(update_fields=['saved_payment_token', 'address', 'city', 'postal_code', 'country'])

        cart_items.delete()

        _send_order_confirmation_email(request.user, order)

        serializer = self.get_serializer(order)
        return Response({
            'order': serializer.data,
            'confirmation_message': f'Order #{order.id} confirmed.',
            'discount_code': discount_code if discount_rate else '',
            'discount_applied': str((discount_rate * Decimal('100')).quantize(Decimal('1'))),
        }, status=status.HTTP_201_CREATED)
