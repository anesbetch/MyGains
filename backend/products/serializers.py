from rest_framework import serializers
from django.db.models import Avg
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'category_name', 'description', 'price', 'image_url',
                  'benefits', 'ingredients', 'sizing', 'goal_tags', 'experience_level',
                  'dietary_preference', 'price_range', 'stock', 'avg_rating', 'review_count', 'created_at']
        read_only_fields = ['created_at']

    def get_avg_rating(self, obj):
        result = obj.reviews.aggregate(avg=Avg('rating'))['avg']
        return round(result, 1) if result else 0

    def get_review_count(self, obj):
        return obj.reviews.count()
