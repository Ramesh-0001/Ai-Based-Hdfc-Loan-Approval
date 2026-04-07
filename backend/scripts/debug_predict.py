import requests
import json

url = 'http://localhost:5001/api/predict-loan'
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
