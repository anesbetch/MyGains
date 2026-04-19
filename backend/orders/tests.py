from rest_framework.test import APITestCase
from rest_framework import status
from users.models import CustomUser
from products.models import Category, Product
from cart.models import CartItem
from orders.models import Order


class OrderFlowTests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(email='order@example.com', username='orderuser', password='Password123!')
        self.category = Category.objects.create(name='Accessories')
        self.product = Product.objects.create(
            name='Shaker Bottle', category=self.category, description='Bottle', price='10.00',
            benefits='Easy mixing', goal_tags='general', experience_level='beginner',
            dietary_preference='vegan', price_range='budget', stock=10
        )
        CartItem.objects.create(user=self.user, product=self.product, quantity=2)
        response = self.client.post('/api/users/login/', {'email': 'order@example.com', 'password': 'Password123!'}, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_create_order_saves_payment_token_and_reduces_stock(self):
        response = self.client.post('/api/orders/create_order/', {
            'shipping_address': '123 Test Street',
            'shipping_city': 'London',
            'shipping_postal_code': 'SW1A1AA',
            'shipping_country': 'UK',
            'payment_token': 'tok_****4242',
            'discount_code': 'FIT10'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Order.objects.filter(user=self.user).exists())
        self.user.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(self.user.saved_payment_token, 'tok_****4242')
        self.assertEqual(self.product.stock, 8)
