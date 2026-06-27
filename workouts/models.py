from django.db import models
from django.contrib.auth.models import User
import uuid
from cloudinary_storage.storage import VideoMediaCloudinaryStorage
from datetime import date



class Exercise(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exercises', null=True)
    name = models.CharField(max_length=100)
    target_muscle = models.CharField(max_length=1000)
    video_url = models.URLField(blank=True, null=True, max_length=500)
    video_file = models.FileField(upload_to='exercise_videos/', blank=True, null=True, storage=VideoMediaCloudinaryStorage, max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class WorkoutSessison(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions', null=True)
    name = models.CharField(max_length=100)
    date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.date}"
    

class WorkoutLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(WorkoutSessison, related_name='logs', on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, related_name='logs', on_delete=models.CASCADE)
    set_number = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    weight = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.exercise.name} - Set {self.set_number}"


class RoutineTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='templates')
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    

class RoutineItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(RoutineTemplate, related_name='items', on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.template.name} - {self.exercise.name}"

class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female')
    ]
    ACTIVITY_CHOICES = [
        ('SEDENTARY', 'Sedentary (Little to no exercise)'),
        ('LIGHT', 'Light (Exercise 1-3 times/week)'),
        ('MODERATE', 'Moderate (Exercise 3-5 times/week)'),
        ('ACTIVE', 'Active (Heavy exercise 6 times/week)'), 
        ('VERY_ACTIVE', 'Very Active (Physical job + heavy exercise)')
    ]
    GOAL_CHOICES = [
        ('CUT', 'Lose Fat'),
        ('MAINTAIN', 'Maintain Weight'),
        ('BULK', 'Build Muscle')
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    has_seen_onboarding = models.BooleanField(default=False)
    
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    weight_kg = models.FloatField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    activity_level = models.CharField(max_length=50, choices=ACTIVITY_CHOICES, blank=True, null=True)
    goal = models.CharField(max_length=50, choices=GOAL_CHOICES, null=True, blank=True)
    
    #calucalte outputs
    target_calories = models.IntegerField(null=True, blank=True)
    target_protein = models.IntegerField(null=True, blank=True)
    target_carbs = models.IntegerField(null=True, blank=True)
    target_fats = models.IntegerField(null=True, blank=True)
      
    def __str__(self):
        return f"{self.user.username}'s profile "
    
    def calculate_macros(self):
        if not all([self.gender, self.date_of_birth, self.weight_kg, self.height_cm, self.activity_level]):
            return
        
        today = date.today()
        age = today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        
        if self.gender == 'M':
            bmr = (10 * self.weight_kg) + (6.25 * self.height_cm) - (5 * age) + 5
        else:
            bmr = (10 * self.weight_kg) + (6.25 * self.height_cm) - (5 * age) - 161
            
        activity_multipliers = {
            'SEDENTARY': 1.2,
            'LIGHT': 1.375,
            'MODERATE': 1.55,
            'ACTIVE': 1.725,
            'VERY_ACTIVE': 1.9
        }        
        
        tdee = bmr * activity_multipliers.get(self.activity_level, 1.2)
        
        if self.goal == 'CUT':
            tdee -= 500
        elif self.goal == 'BULK':
            tdee += 500
        
        self.target_calories = int(tdee)
        
        self.target_protein = int(1.9 * self.weight_kg)
        protein_cals = self.target_protein * 4
        
        fat_cals = self.target_calories * 0.25
        self.target_fats = int(fat_cals / 9)
        
        carb_cals = self.target_calories - (protein_cals + fat_cals)
        self.target_carbs = int(carb_cals / 4)
        
    def save(self, *args, **kwargs):
        self.calculate_macros()
        super().save(*args, **kwargs)
        


class CustomMeal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_meals')
    name = models.CharField(max_length=300)
    calories = models.IntegerField()
    protein = models.IntegerField()
    carbs = models.IntegerField()
    fats = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.calories} kcal"


class DailyFoodLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='food_logs')
    date = models.DateField(default=date.today)

    # add meal without saving or choose from saved meal
    meal_name = models.CharField(max_length=300)
    details = models.TextField(blank=True, null=True)
    custom_meal = models.ForeignKey(CustomMeal, on_delete=models.SET_NULL, null=True, blank=True)
    servings = models.FloatField(default=1.0)

    # copy macros if meal deleted the log does not affect
    calories = models.IntegerField()
    protein = models.IntegerField()
    carbs = models.IntegerField()
    fats = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.meal_name} on {self.date}"
# Create your models here.
