import requests
import json

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
    print("Sending request to http://localhost:5001/api/predict-loan")
    response = requests.post('http://localhost:5001/api/predict-loan', json=app, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
