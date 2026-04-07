import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

BASE_URL = os.getenv('API_URL', 'http://localhost:5001')
url = f'{BASE_URL}/api/predict-loan'
payload = {
    "fullName": "Test User",
    "age": 32,
    "income": 900000,
    "creditScore": 760,
    "employmentType": "Salaried",
    "jobTenure": 5,
    "loanAmount": 2000000,
    "tenure": 240,
    "loanPurpose": "Home",
    "existingLoans": 5000,
    "userId": 1
}

try:
    r = requests.post(url, json=payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
except Exception as e:
    print(f"Error: {e}")
