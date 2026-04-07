import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

BASE_URL = os.getenv('API_URL', 'http://localhost:5001')

data = {
    'fullName': 'dsk',
    'age': 25,
    'income': 600000,
    'creditScore': 750,
    'employmentType': 'Salaried',
    'loanAmount': 100000,
    'loanTenure': 24,
    'loanPurpose': 'Home Renovation',
    'existingEMI': 5000,
    'yearsInCurrentJob': 2,
    'numberOfActiveLoans': 0,
    'numberOfDependents': 0,
    'residentialStatus': 'Rented',
    'cityTier': 'Tier 1',
    'educationLevel': 'Graduate',
    'maritalStatus': 'Single',
    'bankAccountVintageMonths': 24
}

try:
    r = requests.post(f'{BASE_URL}/api/predict-loan', json=data)
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
