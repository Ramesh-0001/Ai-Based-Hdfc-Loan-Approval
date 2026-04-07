import requests
import json

url = 'http://localhost:5001/api/predict-loan'
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
