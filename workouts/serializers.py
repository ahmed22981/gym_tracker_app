from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Exercise, RoutineItem, RoutineTemplate, WorkoutSessison, WorkoutLog
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class ExerciseSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username') # NEW

    class Meta:
        model = Exercise
        fields = '__all__'
        
class WorkoutLogSerializer(serializers.ModelSerializer):
    exercise_name = serializers.ReadOnlyField(source='exercise.name')
    
    video_url = serializers.ReadOnlyField(source='exercise.video_url')
    
    video_file = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkoutLog
        fields = '__all__'
        
    def get_video_file(self, obj):
        if obj.exercise and obj.exercise.video_file:
            return obj.exercise.video_file.url
        return None
        
class WorkoutSessionSerializer(serializers.ModelSerializer):
    logs = WorkoutLogSerializer(many=True, read_only=True)
    user = serializers.ReadOnlyField(source='user.username') # NEW
    
    class Meta:
        model = WorkoutSessison
        fields = '__all__'
        
class RegisterSerializer(serializers.ModelSerializer):
    
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with that email already exists.")]
    )
    first_name = serializers.CharField(required=True, max_length=50)
    last_name = serializers.CharField(required=True, max_length=50)
    
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}
        
        
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        return value
 
 
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token['first_name'] = user.first_name
        
        return token
    
    
# NEW: Template Serializers
class RoutineItemSerializer(serializers.ModelSerializer):
    exercise_name = serializers.ReadOnlyField(source='exercise.name')

    class Meta:
        model = RoutineItem
        fields = ('id', 'template', 'exercise', 'exercise_name', 'order')

class RoutineTemplateSerializer(serializers.ModelSerializer):
    items = RoutineItemSerializer(many=True, read_only=True)
    # Write-only field to accept a list of exercise UUIDs from React
    exercise_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = RoutineTemplate
        fields = ('id', 'name', 'items', 'exercise_ids', 'created_at')

    def create(self, validated_data):
        # Extract the array of exercise IDs
        exercise_ids = validated_data.pop('exercise_ids', [])
        # Create the template itself
        template = RoutineTemplate.objects.create(**validated_data)
        
        # Link the exercises to the template while keeping the order
        for index, ex_id in enumerate(exercise_ids):
            RoutineItem.objects.create(
                template=template,
                exercise_id=ex_id,
                order=index
            )
        return template