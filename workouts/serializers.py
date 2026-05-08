from rest_framework import serializers
from .models import Exercise, WorkoutSessison, WorkoutLog

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'
        
class WorkoutLogSerializer(serializers.ModelSerializer):
    #return exercise name mesh id
    exercise_name = serializers.ReadOnlyField(source='exercise.name')
    
    class Meta:
        model = WorkoutLog
        fields = '__all__'
        
class WorkoutSessionSerializer(serializers.ModelSerializer):
    logs = WorkoutLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = WorkoutSessison
        fields = '__all__'