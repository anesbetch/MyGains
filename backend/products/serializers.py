from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'category_name', 'description', 'price', 'image_url', 
                  'benefits', 'ingredients', 'sizing', 'goal_tags', 'experience_level', 
                  'dietary_preference', 'price_range', 'stock', 'created_at']
        read_only_fields = ['created_at']
