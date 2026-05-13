from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('google/', views.GoogleLoginView.as_view(), name='google_login'),
    
    path('exercises/', views.ExerciseListCreateView.as_view(), name='exercise-list'),
    path('exercises/<uuid:pk>/', views.ExerciseDetailView.as_view(), name='exercise-detail'),

    path('sessions/', views.WorkoutSessionListCreateView.as_view(), name='session-list'),
    path('sessions/<uuid:pk>/', views.WorkoutSessionDetailView.as_view(), name='session-detail'),

    path('logs/', views.WorkoutLogListCreateView.as_view(), name='log-list'),
    path('logs/<uuid:pk>/', views.WorkoutLogDetailView.as_view(), name='log-detail'),  # NEW
]