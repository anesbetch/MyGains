from rest_framework import serializers
from .models import ChatMessage, CustomQAPair, ChatSettings


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'message', 'response', 'response_source', 'matched_question', 'created_at']
        read_only_fields = ['id', 'response', 'response_source', 'matched_question', 'created_at']


class CustomQAPairSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomQAPair
        fields = ['id', 'question', 'answer', 'keywords', 'match_type', 'priority', 'is_active', 'use_as_priority_answer']


class ChatSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSettings
        fields = ['prioritize_custom_qa', 'use_external_api', 'external_api_url', 'external_api_timeout']
