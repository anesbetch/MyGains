from rest_framework import serializers
from .models import GuidanceSession

class GuidanceSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuidanceSession
        fields = ['id', 'goal', 'experience', 'dietary_preference', 'budget', 'created_at']
        read_only_fields = ['id', 'created_at']
