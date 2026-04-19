from django.db import models

class Category(models.Model):
    """Product categories: Supplements, Clothing, Accessories"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """Gym and fitness products"""
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.CharField(max_length=500, blank=True)
    
    # Product details
    benefits = models.TextField(help_text="Key benefits of the product")
    ingredients = models.TextField(blank=True, help_text="For supplements: ingredients list")
    sizing = models.CharField(max_length=100, blank=True, help_text="For clothing: size options")
    
    # Guidance system attributes
    goal_tags = models.CharField(max_length=200, blank=True, help_text="muscle,fat_loss,general")
    experience_level = models.CharField(max_length=50, blank=True, help_text="beginner,intermediate,advanced")
    dietary_preference = models.CharField(max_length=100, blank=True, help_text="omnivore,vegetarian,vegan")
    price_range = models.CharField(max_length=50, blank=True, help_text="budget,mid,premium")
    
    stock = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
