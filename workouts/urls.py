from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('google/', views.GoogleLoginView.as_view(), name='google_login'),
    
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
    
    path('analytics/heatmap/', views.MuscleHeatMapView.as_view(), name='analytics-heatmap')
]