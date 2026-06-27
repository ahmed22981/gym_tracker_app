import os
import json
from google import genai
from rest_framework import generics, status
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated 
from .models import Exercise, WorkoutSessison, WorkoutLog, RoutineTemplate, RoutineItem, UserProfile, CustomMeal, DailyFoodLog
from .serializers import ExerciseSerializer, RegisterSerializer, WorkoutLogSerializer, WorkoutSessionSerializer, CustomTokenObtainPairSerializer, RoutineTemplateSerializer, UserProfileSerializer, CustomMealSerializer, DailyFoodLogSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

 #GOOGLE AUTH
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from datetime import date, timedelta, datetime
from django.utils import timezone
from django.db.models import Count, Sum


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
                # "1095409291507-ngoouu6ff0n4iakv6qs506i3vd528rat.apps.googleusercontent.com"
                audience = settings.GOOGLE_CLIENT_ID
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
            
            if hasattr(user, 'profile'):
                access_token['has_seen_onboarding'] = user.profile.has_seen_onboarding
            else:
                access_token['has_seen_onboarding'] = False


            return Response({
                'refresh': str(refresh),
                'access': str(access_token),
            })

        except ValueError as e:
            # THIS WILL PRINT THE EXACT GOOGLE ERROR IN YOUR DJANGO TERMINAL!
            print("GOOGLE TOKEN VERIFICATION FAILED:", str(e))
            return Response({'error': 'Invalid Google token', 'details': str(e)}, status=400)
        
class RoutineTemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = RoutineTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return RoutineTemplate.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        

class RoutineTemplateDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = RoutineTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return RoutineTemplate.objects.filter(user=self.request.user)        
    
# Starts a session and pulls your previous weights/reps
class StartTemplateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            template = RoutineTemplate.objects.get(pk=pk, user=request.user)
        except RoutineTemplate.DoesNotExist:
            return Response({"error": "Template not found"}, status=404)

        # 1. Create a brand new empty session using the Template's name
        session = WorkoutSessison.objects.create(
            user=request.user,
            name=template.name
        )

        # 2. Loop through all exercises saved in this template
        items = template.items.all().order_by('order')
        
        for item in items:
            # 3. Find the most recent time the user performed this specific exercise
            last_log = WorkoutLog.objects.filter(
                session__user=request.user, 
                exercise=item.exercise
            ).order_by('-created_at').first()

            if last_log:
                # Get ALL the sets from that previous session
                old_logs = WorkoutLog.objects.filter(
                    session=last_log.session,
                    exercise=item.exercise
                ).order_by('set_number')
                
                # Clone them into the new session!
                for old_log in old_logs:
                    WorkoutLog.objects.create(
                        session=session,
                        exercise=item.exercise,
                        set_number=old_log.set_number,
                        reps=old_log.reps,     # Pre-fill previous reps
                        weight=old_log.weight  # Pre-fill previous weight
                    )
            else:
                # If they have NEVER done this exercise before, just create 1 empty set
                WorkoutLog.objects.create(
                    session=session,
                    exercise=item.exercise,
                    set_number=1,
                    reps=0,
                    weight=0.0
                )

        # Return the newly created session with all its populated logs to React
        serializer = WorkoutSessionSerializer(session)
        return Response(serializer.data, status=201)
    
# Analytics
class MuscleHeatMapView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        logs = WorkoutLog.objects.filter(
            session__user=request.user,
            created_at__gte=thirty_days_ago
        )
        
        muscle_counts = logs.values('exercise__target_muscle').annotate(set_count=Count('id'))
        
        heatmap_data = {}
        for item in muscle_counts:
            muscle_string = item['exercise__target_muscle'].lower()
            count = item['set_count']
            
            for m in [x.strip() for x in muscle_string.split(',')]:
                if m:
                    heatmap_data[m] = heatmap_data.get(m, 0) + count
        
        return Response(heatmap_data)
    

class ExerciseProgressView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        logs = WorkoutLog.objects.filter(
            session__user = request.user,
            exercise_id = pk,
        ).select_related('session').order_by('session__date')
        
        progress_dict = {}
        
        for log in logs:
            date_str = str(log.session.date)
            
            if date_str not in progress_dict:
                progress_dict[date_str] = log.weight
            else:
                if log.weight > progress_dict[date_str]:
                    progress_dict[date_str] = log.weight
        
        chart_data = [{"date": k, "max_weight": v} for k, v in progress_dict.items()]
        
        return Response(chart_data)
                
        
# Update onboarding status
class CompleteOnboardingView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.has_seen_onboarding = True
        profile.save()
        return Response({"status: Onboarding complete"})
    
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile = UserProfile.objects.filter(user=self.request.user).first()
        
        if not profile:
            profile = UserProfile.objects.create(user = self.request.user)
        return profile

# Custom Meals View
class CustomMealListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomMealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomMeal.objects.filter(user=self.request.user).order_by("-created_at")
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
class CustomMealDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomMealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomMeal.objects.filter(user=self.request.user)
    
#Daily food log view
class DailyFoodLogListCreateView(generics.ListCreateAPIView):
    serializer_class = DailyFoodLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        date_str = self.request.query_params.get('date', str(date.today()))
        return DailyFoodLog.objects.filter(user=self.request.user, date=date_str).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
class DailyFoodLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DailyFoodLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyFoodLog.objects.filter(user=self.request.user)
    
#Summary View for frontend dashboard
class DailyNutritionSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get('date', str(date.today()))

        logs = DailyFoodLog.objects.filter(user=request.user, date=date_str)

        summary = logs.aggregate(
            consumed_calories=Sum('calories'),
            consumed_protein=Sum('protein'),
            consumed_carbs=Sum('carbs'),
            consumed_fats=Sum('fats')
        )

        return Response({
            "date": date_str,
            "consumed_calories": summary['consumed_calories'] or 0,
            "consumed_protein": summary['consumed_protein'] or 0,
            "consumed_carbs": summary['consumed_carbs'] or 0,
            "consumed_fats": summary['consumed_fats'] or 0,
        })
    
class GenerateAIMealPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            
            if not profile.target_calories:
                return Response(
                    {"error": "Please calculate your macros first."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            prompt = f"""
            You are an expert sports nutritionist. Create a 1-day healthy, diverse, and Egyptian-friendly fitness meal plan for a person with the following profile:
            - Goal: {profile.get_goal_display()}
            - Target Calories: {profile.target_calories} kcal
            - Macros: {profile.target_protein}g Protein, {profile.target_carbs}g Carbs, {profile.target_fats}g Fats.
            
            Dietary Guidelines:
            1. Focus on HIGH-QUALITY, HEALTHY whole foods. Avoid empty calories or highly processed ingredients.
            2. Introduce strong VARIETY across the meals. Do not repeat the same protein or carb sources in every meal. Mix it up!
            3. Use delicious and nutritious Egyptian staples creatively (e.g., Foul mudammas with olive oil, grilled fish, lean beef, Qareesh cheese, eggs, sweet potatoes, oats, and plenty of fresh colorful vegetables/salads).
            4. The meals must support intense physical training recovery while remaining realistic and easy to prep.
            
            IMPORTANT: Return ONLY a valid JSON object with the exact following structure. No introductions, no markdown, just the JSON:
            {{
                "plan_title": "string",
                "total_calories": number,
                "total_protein": number,
                "total_carbs": number,
                "total_fats": number,
                "meals": [
                    {{
                        "meal_category": "string (e.g., Breakfast, Lunch, Snack, Dinner)",
                        "meal_name": "string",
                        "items": ["string", "string"],
                        "calories": number,
                        "protein": number,
                        "carbs": number,
                        "fats": number
                    }}
                ]
            }}
            """

            client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            
            text = response.text
            
            start_idx = text.find('{')
            end_idx = text.rfind('}')
            
            if start_idx == -1 or end_idx == -1:
                raise ValueError("AI did not return a valid JSON format.")
                
            json_str = text[start_idx:end_idx+1]
            meal_plan = json.loads(json_str)
            
            return Response(meal_plan, status=status.HTTP_200_OK)

        except UserProfile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"AI GENERATION ERROR: {str(e)}") 
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class SaveAIMealPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            meals_data = request.data.get("meals", [])
            log_date = request.data.get("date")

            if not log_date or not meals_data:
                return Response(
                    {"error": "Missing date or meals data."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            logs_to_create = []

            for meal in meals_data:
                category = meal.get("meal_category", "Meal")
                name = meal.get("meal_name", "AI Meal")
                
                items_str = "• " + "\n• ".join(meal.get("items", [])) if meal.get("items") else ""

                logs_to_create.append(
                    DailyFoodLog(
                        user=request.user,
                        date=log_date,
                        meal_name=f"{category} - {name}"[:255], 
                        details=items_str,        
                        servings=1,
                        calories=meal.get("calories", 0),
                        protein=meal.get("protein", 0),
                        carbs=meal.get("carbs", 0),
                        fats=meal.get("fats", 0)
                    )
                )

            if logs_to_create:
                DailyFoodLog.objects.bulk_create(logs_to_create)

            return Response({"message": "Meal plan saved to your log successfully!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)