from rest_framework import generics
from .models import Exercise, WorkoutSessison, WorkoutLog
from .serializers import ExerciseSerializer, WorkoutLogSerializer, WorkoutSessionSerializer

# Exercise views
class ExerciseListCreateView(generics.ListCreateAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class ExerciseDetailView(generics.RetrieveDestroyAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

# Workout session views
class WorkoutSessionListCreateView(generics.ListCreateAPIView):
    queryset = WorkoutSessison.objects.all()
    serializer_class = WorkoutSessionSerializer

class WorkoutSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkoutSessison.objects.all()
    serializer_class = WorkoutSessionSerializer

# Workout log views
class WorkoutLogListCreateView(generics.ListCreateAPIView):
    queryset = WorkoutLog.objects.all()
    serializer_class = WorkoutLogSerializer

class WorkoutLogDetailView(generics.RetrieveUpdateDestroyAPIView):  # NEW
    queryset = WorkoutLog.objects.all()
    serializer_class = WorkoutLogSerializer