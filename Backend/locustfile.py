from locust import HttpUser, TaskSet, task, between
from datetime import datetime, timedelta

class UserBehavior(TaskSet):
    def on_start(self):
        # Initialize with base parameters for each user session
        self.base_currency = "USD"
        self.target_currencies = ["EUR", "CAD"]
        self.start_date = datetime.now().date() - timedelta(days=30)
        self.end_date = datetime.now().date()

    @task
    def fetch_exchange_rates(self):
        # Randomly adjust parameters for each request
        base_currency = self.base_currency
        target_currencies = ','.join(self.target_currencies)
        start_date = self.start_date.isoformat()
        end_date = self.end_date.isoformat()

        # Make GET request to the API endpoint
        response = self.client.get(
            f"/api/v1/exchange-rates/?base_currency={base_currency}&target_currencies={target_currencies}&start_date={start_date}&end_date={end_date}"
        )

        # Check if response status is 200 and handle errors if any
        if response.status_code == 200:
            # Optionally parse and validate response content
            rates = response.json().get('rates', {})
            print(f"Received rates: {rates}")
        else:
            print(f"Request failed with status code: {response.status_code}")

class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(1, 5)
