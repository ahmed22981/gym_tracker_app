from locust import HttpUser, task, between
import random
import string

class GymDiaryUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        self.username = f"tester_{random_str}"
        self.email = f"{self.username}@gymtracker.com"
        self.password = "StrongPassword123!"

        reg_payload = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "first_name": "Locust",
            "last_name": "Tester"
        }
        reg_response = self.client.post("/api/register/", json=reg_payload)
        
        if reg_response.status_code not in [200, 201]:
            print(f"❌ REGISTER ERROR: {reg_response.text}")

        login_payload = {
            "username": self.username,
            "password": self.password
        }
        
        login_response = self.client.post("/api/login/", json=login_payload)

        if login_response.status_code == 200:
            self.token = login_response.json().get("access")
            self.headers = {
                "Authorization": f"Bearer {self.token}", 
                "Content-Type": "application/json"
            }
            
            template_payload = {
                "name": "Locust Workout",
            }
            temp_response = self.client.post("/api/templates/", json=template_payload, headers=self.headers)
            
            if temp_response.status_code in [200, 201]:
                self.template_id = temp_response.json().get("id")
                print(f"✅ Template created: {self.template_id}")
            else:
                print(f"❌ Failed to create template: {temp_response.text}")
                self.template_id = None
                
        else:
            print(f"❌ LOGIN ERROR: {login_response.text}")
            self.headers = {"Content-Type": "application/json"}
        
        self.exercise_id = "a581d159-bc64-4a98-b6a6-3decce395351"
        self.session_id = "2416592c-aa59-48de-932d-2a3e2f78a9c9"

    @task(3)
    def get_workout_logs(self):
        if hasattr(self, 'headers'):
            self.client.get(
                "/api/logs/", 
                headers=self.headers, 
                name="Get Workout Logs"
            )

    @task(2)
    def start_template(self):
        if not self.template_id:
            print("❌ Template ID is missing!")
            return

        url = f"/api/templates/{self.template_id}/start/"
        response = self.client.post(
            url, 
            headers=self.headers, 
            name="Start Template"
        )
        
        if response.status_code == 404:
            print(f"❌ 404 Error: Tried to access {url}")

    @task(1)
    def create_single_log(self):
        payload = {
            "session": self.session_id,
            "exercise": self.exercise_id,
            "set_number": 1,
            "reps": 10,
            "weight": 20.5
        }
        self.client.post(
            "/api/logs/", 
            json=payload,
            headers=self.headers, 
            name="Create Workout Log"
        )