from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import CustomUser
from products.models import Category, Product
from cart.models import CartItem


class CartFlowTests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(email='cart@example.com', username='cartuser', password='Password123!')
        self.category = Category.objects.create(name='Supplements')
        self.product = Product.objects.create(
            name='Whey Protein', category=self.category, description='Protein', price='29.99',
            benefits='Recovery', goal_tags='muscle', experience_level='beginner',
            dietary_preference='omnivore', price_range='budget', stock=5
        )
        response = self.client.post('/api/users/login/', {'email': 'cart@example.com', 'password': 'Password123!'}, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_add_and_update_cart_item(self):
        response = self.client.post('/api/cart/', {'product_id': self.product.id, 'quantity': 2}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item_id = response.data['id']

        update_response = self.client.patch(f'/api/cart/{item_id}/', {'quantity': 3}, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['quantity'], 3)
        self.assertEqual(CartItem.objects.get(id=item_id).quantity, 3)
