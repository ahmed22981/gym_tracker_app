from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated 
from .models import Exercise, WorkoutSessison, WorkoutLog
from .serializers import ExerciseSerializer, RegisterSerializer, WorkoutLogSerializer, WorkoutSessionSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# NEW IMPORTS FOR GOOGLE AUTH
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)


# Exercise views
class ExerciseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Exercise.objects.filter(user=self.request.user)
        
    def perform_create(self, serializer): 
        serializer.save(user=self.request.user)

class ExerciseDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Exercise.objects.filter(user=self.request.user)

# Workout session views
class WorkoutSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkoutSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutSessison.objects.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WorkoutSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkoutSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutSessison.objects.filter(user=self.request.user)

# Workout log views
class WorkoutLogListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkoutLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutLog.objects.filter(session__user=self.request.user)

class WorkoutLogDetailView(generics.RetrieveUpdateDestroyAPIView):  
    serializer_class = WorkoutLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutLog.objects.filter(session__user=self.request.user)

class GoogleLoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        
        try:
            # 2. Verify token
            # MAKE SURE YOUR REAL CLIENT ID IS HERE VVVVVV
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                "1095409291507-ngoouu6ff0n4iakv6qs506i3vd528rat.apps.googleusercontent.com" # <-- REPLACE THIS!
            )

            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            user, created = User.objects.get_or_create(username=email, defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            })

            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            access_token['first_name'] = user.first_name

            return Response({
                'refresh': str(refresh),
                'access': str(access_token),
            })

        except ValueError as e:
            # THIS WILL PRINT THE EXACT GOOGLE ERROR IN YOUR DJANGO TERMINAL!
            print("GOOGLE TOKEN VERIFICATION FAILED:", str(e))
            return Response({'error': 'Invalid Google token', 'details': str(e)}, status=400)