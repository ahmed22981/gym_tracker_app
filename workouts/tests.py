from django.test import TestCase
from django.contrib.auth.models import User
from .models import Exercise, WorkoutSessison, WorkoutLog, RoutineTemplate, RoutineItem

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class GymModelsTest(TestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(username='ahmed', password='123')
        
        self.exercise = Exercise.objects.create(
            user=self.user, name='Lat Pulldown', target_muscle='Back'
        )
        
        self.session = WorkoutSessison.objects.create(
            user=self.user, name='Pull Day'
        )
        
        self.template = RoutineTemplate.objects.create(
            user=self.user, name='Hypertrophy Pull'
        )

    def test_exercise_model(self):
        self.assertEqual(self.exercise.name, 'Lat Pulldown')
        self.assertEqual(str(self.exercise), 'Lat Pulldown')

    def test_workout_session_model(self):
        self.assertEqual(self.session.name, 'Pull Day')
        expected_str = f"Pull Day - {self.session.date}"
        self.assertEqual(str(self.session), expected_str)

    def test_workout_log_model(self):
        log = WorkoutLog.objects.create(
            session=self.session, 
            exercise=self.exercise,
            set_number=1, 
            reps=10, 
            weight=50.5
        )
        self.assertEqual(log.reps, 10)
        self.assertEqual(log.weight, 50.5)
        
        self.assertEqual(str(log), 'Lat Pulldown - Set 1')

    def test_routine_template_model(self):
        self.assertEqual(self.template.name, 'Hypertrophy Pull')
        self.assertEqual(str(self.template), 'Hypertrophy Pull')

    def test_routine_item_model(self):
        item = RoutineItem.objects.create(
            template=self.template, 
            exercise=self.exercise, 
            order=2
        )
        self.assertEqual(item.order, 2)
        self.assertEqual(str(item), 'Hypertrophy Pull - Lat Pulldown')
        
#Test Api

class GymApiTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test_api', password='testpassword123', email='ahmed@test.com')
        
        self.exercise = Exercise.objects.create(
            user=self.user, name='Bench Press', target_muscle='Chest'
        )
        
        self.session = WorkoutSessison.objects.create(
            user=self.user, name='Push Day'
        )
        
        self.exercise_list_url = reverse('exercise-list')
        self.heatmap_url = reverse('analytics-heatmap')
        self.token_url = reverse('token_obtain_pair')
        
    #Authentication Test
    def test_get_jwt_token(self):
        data = {
            'username': 'test_api',
            'password': 'testpassword123'
        }
        response = self.client.post(self.token_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
    #Exercise View Test
    def test_get_exercise_unauthorized(self):
        # if user not login can not see the exerciese
        #force login
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.exercise_list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Bench Press')
        
    def test_get_exercise_authorized(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.exercise_list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Bench Press')
        
    def test_create_exercise(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'Incline Dumbbell Press',
            'target_muscle': 'Chest, Shoulders'
        }
        response = self.client.post(self.exercise_list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Exercise.objects.count(), 2)
        
    #Analytics Test
    def test_muscle_heatmap_logic(self):
        self.client.force_authenticate(user=self.user)
        
        WorkoutLog.objects.create(
            session = self.session, exercise = self.exercise, set_number = 1, reps = 10, weight = 60
        )
        WorkoutLog.objects.create(
            session = self.session, exercise = self.exercise, set_number = 2, reps = 10, weight = 60
        )
        
        response = self.client.get(self.heatmap_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['chest'], 2)



        
        
        

class StartTemplateIntegrationTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='integration_user', password='123')
        self.client.force_authenticate(user=self.user)

        self.squat = Exercise.objects.create(user=self.user, name='Squat', target_muscle='Legs')
        self.bench = Exercise.objects.create(user=self.user, name='Bench Press', target_muscle='Chest')

        self.template = RoutineTemplate.objects.create(user=self.user, name='Full Body Power')
        RoutineItem.objects.create(template=self.template, exercise=self.squat, order=1)
        RoutineItem.objects.create(template=self.template, exercise=self.bench, order=2)

        self.start_url = reverse('template-start', kwargs={'pk': self.template.id})



    def test_start_template_first_time(self):
        
        response = self.client.post(self.start_url)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.assertEqual(WorkoutSessison.objects.count(), 1)
        
        logs = WorkoutLog.objects.all()
        self.assertEqual(logs.count(), 2)
        
        for log in logs:
            self.assertEqual(log.weight, 0.0)
            self.assertEqual(log.reps, 0)



    def test_start_template_with_previous_history(self):
        
        old_session = WorkoutSessison.objects.create(user=self.user, name='Old Full Body')
        
        WorkoutLog.objects.create(session=old_session, exercise=self.squat, set_number=1, reps=10, weight=100)
        WorkoutLog.objects.create(session=old_session, exercise=self.squat, set_number=2, reps=8, weight=110)
        
        WorkoutLog.objects.create(session=old_session, exercise=self.bench, set_number=1, reps=5, weight=80)

        response = self.client.post(self.start_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(WorkoutSessison.objects.count(), 2)
        
        new_session = WorkoutSessison.objects.exclude(id=old_session.id).first()

        new_squat_logs = WorkoutLog.objects.filter(session=new_session, exercise=self.squat)
        
        self.assertEqual(new_squat_logs.count(), 2)
        
        self.assertEqual(new_squat_logs.get(set_number=1).weight, 100)
        self.assertEqual(new_squat_logs.get(set_number=2).weight, 110)

        new_bench_logs = WorkoutLog.objects.filter(session=new_session, exercise=self.bench)
        self.assertEqual(new_bench_logs.count(), 1)
        self.assertEqual(new_bench_logs.get(set_number=1).weight, 80)