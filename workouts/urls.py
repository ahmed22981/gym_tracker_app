from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('google/', views.GoogleLoginView.as_view(), name='google_login'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    
    path('exercises/', views.ExerciseListCreateView.as_view(), name='exercise-list'),
    path('exercises/<uuid:pk>/', views.ExerciseDetailView.as_view(), name='exercise-detail'),
    
    path('exercises/<uuid:pk>/progress/', views.ExerciseProgressView.as_view(), name='exercise-progress'),
    
    path('sessions/', views.WorkoutSessionListCreateView.as_view(), name='session-list'),
    path('sessions/<uuid:pk>/', views.WorkoutSessionDetailView.as_view(), name='session-detail'),

    path('logs/', views.WorkoutLogListCreateView.as_view(), name='log-list'),
    path('logs/<uuid:pk>/', views.WorkoutLogDetailView.as_view(), name='log-detail'),
    
    path('templates/', views.RoutineTemplateListCreateView.as_view(), name='template-list'),
    path('templates/<uuid:pk>/', views.RoutineTemplateDetailView.as_view(), name='template-detail'),
    path('templates/<uuid:pk>/start/', views.StartTemplateView.as_view(), name='template-start'),
    
    path('analytics/heatmap/', views.MuscleHeatMapView.as_view(), name='analytics-heatmap'),
    
    path('users/onboarding/', views.CompleteOnboardingView.as_view(), name='complete-onboarding'),
    path('users/profile/', views.UserProfileView.as_view(), name='user-profile'),

    # Nutrition & food track
    path('nutrition/custom-meals/', views.CustomMealListCreateView.as_view(), name='custom-meal-list'),
    path('nutrition/custom-meals/<uuid:pk>/', views.CustomMealDetailView.as_view(), name='custom-meal-detail'),

    path('nutrition/logs/', views.DailyFoodLogListCreateView.as_view(), name='food-log-list'),
    path('nutrition/logs/<uuid:pk>/', views.DailyFoodLogDetailView.as_view(), name='food-log-detail'),

    path('nutrition/summary/', views.DailyNutritionSummaryView.as_view(), name='nutrition-summary'),

    path('nutrition/generate-ai-plan/', views.GenerateAIMealPlanView.as_view(), name='generate-ai-plan'),
    path('nutrition/save-ai-plan/', views.SaveAIMealPlanView.as_view(), name='save-ai-plan')
]