from locust import HttpUser, task, between

class GymDiaryUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        # انسخ التتوكن الصافي هنا بين العلامتين (من غير أي كلمات عربية)
        self.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgzOTY3NTQ3LCJpYXQiOjE3ODM5NjcyNDcsImp0aSI6IjkwZjk2ZGI4MDUzNjRiYjY5ZjkxZjg5MzEyNWEzOWYxIiwidXNlcl9pZCI6IjkiLCJmaXJzdF9uYW1lIjoiQWhtZWQiLCJoYXNfc2Vlbl9vbmJvYXJkaW5nIjp0cnVlfQ.OluDNm1bDTsA5zMb2kVCMMcU_S8YFYTK2Uh8u-jlB4g"
        
        self.headers = {
            "Authorization": f"Bearer {self.token}", 
            "Content-Type": "application/json"
        }
        
        self.template_id = "b27062eb-67f4-4e20-9b14-f943044ae29e"
        self.exercise_id = "a581d159-bc64-4a98-b6a6-3decce395351"

    @task(3)
    def get_workout_logs(self):
        self.client.get(
            "/api/workout-logs/", 
            headers=self.headers, 
            name="Get Workout Logs"
        )

    @task(2)
    def start_template(self):
        self.client.post(
            f"/api/templates/{self.template_id}/start/", 
            headers=self.headers, 
            name="Start Template"
        )

    @task(1)
    def create_single_log(self):
        payload = {
            "exercise": self.exercise_id,
            "set_number": 1,
            "reps": 10,
            "weight": 20.5
        }
        self.client.post(
            "/api/workout-logs/", 
            json=payload,
            headers=self.headers, 
            name="Create Workout Log"
        )