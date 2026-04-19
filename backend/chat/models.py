from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatSettings(models.Model):
    """Singleton-style settings to control the chatbot behaviour."""
    prioritize_custom_qa = models.BooleanField(
        default=True,
        help_text='If enabled, admin-defined Q&A pairs are checked before external APIs and OpenAI.'
    )
    use_external_api = models.BooleanField(
        default=False,
        help_text='If enabled, the assistant can fetch answers from the configured external API.'
    )
    external_api_url = models.URLField(blank=True)
    external_api_key = models.CharField(max_length=255, blank=True)
    external_api_timeout = models.PositiveIntegerField(default=6)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Chat Settings'
        verbose_name_plural = 'Chat Settings'

    def __str__(self):
        return 'Chat Settings'

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class CustomQAPair(models.Model):
    MATCH_CHOICES = [
        ('contains', 'Contains keyword'),
        ('exact', 'Exact question'),
    ]

    question = models.CharField(max_length=255, unique=True)
    answer = models.TextField()
    keywords = models.CharField(
        max_length=255,
        blank=True,
        help_text='Optional comma-separated keywords to improve matching.'
    )
    match_type = models.CharField(max_length=20, choices=MATCH_CHOICES, default='contains')
    priority = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)
    use_as_priority_answer = models.BooleanField(
        default=True,
        help_text='When matched, prefer this answer over API/OpenAI responses.'
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['priority', '-updated_at', 'question']
        verbose_name = 'Custom Q&A Pair'
        verbose_name_plural = 'Custom Q&A Pairs'

    def __str__(self):
        return self.question

    def keyword_list(self):
        return [item.strip().lower() for item in self.keywords.split(',') if item.strip()]


class ExternalKnowledgeItem(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    source_label = models.CharField(max_length=120, blank=True)
    is_active = models.BooleanField(default=True)
    synced_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['question']
        verbose_name = 'External Knowledge Item'
        verbose_name_plural = 'External Knowledge Items'

    def __str__(self):
        return self.question


class ChatMessage(models.Model):
    RESPONSE_SOURCE_CHOICES = [
        ('custom_qa', 'Custom Q&A'),
        ('external_api', 'External API'),
        ('openai', 'OpenAI'),
        ('rule_based', 'Rule Based'),
        ('smart_recommendation', 'Smart Recommendation'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages', null=True, blank=True)
    message = models.TextField()
    response = models.TextField()
    response_source = models.CharField(max_length=30, choices=RESPONSE_SOURCE_CHOICES, default='rule_based')
    matched_question = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Chat - {self.created_at}"
