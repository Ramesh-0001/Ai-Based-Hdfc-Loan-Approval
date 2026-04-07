import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

BASE_URL = os.getenv('API_URL', 'http://localhost:5001')
url = f'{BASE_URL}/api/predict-loan'
payload = {
    "fullName": "Education Test",
    "email": "edu@test.com",
    "mobile": "9876543210",
    "age": 21,
    "income": 0,
    "employmentType": "Student",
    "creditScore": 600,
    "existingLoans": 0,
    "repaymentHistory": "Excellent",
    "jobTenure": 0,
    "loanAmount": 500000,
    "loanPurpose": "Education",
    "tenure": 36,
    "userId": 1,
    "coApplicantIncome": 1000000,
    "coApplicantExistingDebt": 50000,
    "previousMarks": 85,
    "collegeName": "HDFC Tech",
    "courseName": "AI Course"
}

try:
    r = requests.post(url, json=payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
except Exception as e:
    print(f"Error: {e}")
