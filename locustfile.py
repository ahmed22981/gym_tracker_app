from locust import HttpUser, task, between

class GymDiaryUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        # 1. حط التوكن اللي جبته من الـ Inspect هنا
        self.headers = {
            "Authorization": f"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgzOTY2ODc3LCJpYXQiOjE3ODM5NjY1NzgsImp0aSI6IjgyYjQxY2Y0Y2NiYzQ1NDY5N2M4MGYwNmYwMTdjOWY2IiwidXNlcl9pZCI6IjkifQ.gXoZqn-mkLXbCdWlAUrFf_uit47jPvSIeoSE_nrrBkc", 
            "Content-Type": "application/json"
        }
        
        # 2. حط الـ ID بتاع التمبلت اللي جبته من الـ Network
        self.template_id = 1 
        
        # 3. حط ID بتاع أي تمرين (Exercise) موجود عندك في الداتابيز عشان نجرب نضيف سجل (Log)
        self.exercise_id = 1 

    @task(3)
    def get_workout_logs(self):
        self.client.get(
            "/api/workout-logs/", 
            headers=self.headers, 
            name="1. Get Workout Logs"
        )

    @task(2)
    def start_template(self):
        self.client.post(
            f"/api/templates/{self.template_id}/start/", 
            headers=self.headers, 
            name="2. Start Template"
        )

    @task(1)
    def create_single_log(self):
        # بنجرب نعمل ضغط على عملية إضافة سجل جديد
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
            name="3. Create Workout Log"
        )