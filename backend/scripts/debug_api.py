import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

BASE_URL = os.getenv('API_URL', 'http://localhost:5001')

app = {
    'fullName': 'Dhanush',
    'age': 25,
    'income': 600000,
    'creditScore': 750,
    'employmentType': 'Salaried',
    'loanAmount': 100000,
    'tenure': 24,
    'loanPurpose': 'Home',
    'existingEmis': 5000
}

try:
    print(f"Sending request to {BASE_URL}/api/predict-loan")
    response = requests.post(f'{BASE_URL}/api/predict-loan', json=app, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
