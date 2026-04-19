from django.contrib import admin
from .models import ChatMessage, CustomQAPair, ChatSettings, ExternalKnowledgeItem


@admin.register(ChatSettings)
class ChatSettingsAdmin(admin.ModelAdmin):
    list_display = ('prioritize_custom_qa', 'use_external_api', 'external_api_url', 'updated_at')


@admin.register(CustomQAPair)
class CustomQAPairAdmin(admin.ModelAdmin):
    list_display = ('question', 'match_type', 'priority', 'is_active', 'use_as_priority_answer', 'updated_at')
    list_filter = ('is_active', 'match_type', 'use_as_priority_answer')
    search_fields = ('question', 'answer', 'keywords')
    ordering = ('priority', '-updated_at')


@admin.register(ExternalKnowledgeItem)
class ExternalKnowledgeItemAdmin(admin.ModelAdmin):
    list_display = ('question', 'source_label', 'is_active', 'synced_at')
    list_filter = ('is_active', 'source_label')
    search_fields = ('question', 'answer', 'source_label')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('message', 'response_source', 'matched_question', 'created_at')
    list_filter = ('response_source', 'created_at')
    search_fields = ('message', 'response', 'matched_question')
