from django.contrib import admin
from .models import Exercise, WorkoutSessison, WorkoutLog, RoutineItem, RoutineTemplate


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

@admin.register(RoutineTemplate)
class RoutineTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    
@admin.register(RoutineItem)
class RoutineItemAdmin(admin.ModelAdmin):
    list_display = ('template', 'exercise', 'order')
    
    
    


# Register your models here.
