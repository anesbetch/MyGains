from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class GuidanceSession(models.Model):
    """User guidance session with quiz answers"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='guidance_sessions', null=True, blank=True)
    
    # Quiz answers
    goal = models.CharField(max_length=50, choices=[
        ('muscle', 'Build Muscle'),
        ('fat_loss', 'Lose Fat'),
        ('general', 'General Fitness'),
    ])
    experience = models.CharField(max_length=50, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ])
    dietary_preference = models.CharField(max_length=50, choices=[
        ('omnivore', 'Omnivore'),
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
    ])
    budget = models.CharField(max_length=50, choices=[
        ('budget', 'Budget ($)'),
        ('mid', 'Mid-range ($$)'),
        ('premium', 'Premium ($$$)'),
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Guidance - {self.goal} - {self.experience}"
