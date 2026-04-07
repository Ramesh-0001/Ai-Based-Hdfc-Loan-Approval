
import requests
import json

BASE_URL = "http://localhost:5001"

def test_general_loan():
    print("\n--- Testing General Personal Loan Eligibility ---")
    payload = {
        "fullName": "John Doe",
        "income": 1200000,
        "creditScore": 750,
        "loanAmount": 500000,
        "loanTenure": 36,
        "loanPurpose": "Personal",
        "existingEMI": 5000
    }
    response = requests.post(f"{BASE_URL}/api/predict-loan", json=payload)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(json.dumps(result, indent=2))
    return result

def test_education_loan():
    print("\n--- Testing Education Loan Eligibility ---")
    payload = {
        "fullName": "Student Jane",
        "income": 600000, # Parent income
        "creditScore": 720,
        "loanAmount": 400000,
        "loanTenure": 60,
        "loanPurpose": "Education",
        "studentMarks": 85,
        "courseType": "Engineering",
        "collegeTier": "Tier 1",
        "courseDuration": 4
    }
    response = requests.post(f"{BASE_URL}/api/predict-loan", json=payload)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(json.dumps(result, indent=2))
    return result

if __name__ == "__main__":
    try:
        test_general_loan()
        test_education_loan()
    except Exception as e:
        print(f"Error: {e}")
