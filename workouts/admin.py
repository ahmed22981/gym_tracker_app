from django.contrib import admin
from .models import Exercise, WorkoutSessison, WorkoutLog


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'target_muscle', 'created_at')
    search_fields = ('name', 'target_muscle')


@admin.register(WorkoutSessison)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display = ('name', 'date')
    search_fields = ('name',)
    
@admin.register(WorkoutLog)
class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ('session', 'exercise', 'set_number', 'reps', 'weight')
    list_filter = ('session', 'exercise')



# Register your models here.
