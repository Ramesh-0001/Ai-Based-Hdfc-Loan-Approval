
import requests
import json

def test_api():
    url = "http://localhost:5001/api/predict-loan"
    headers = {"Content-Type": "application/json"}
    
    # Test a "low risk" fraud but "rejected" loan for recommendations
    data = {
        "fullName": "Test User",
        "age": 28,
        "income": 400000,
        "creditScore": 620,
        "employmentType": "Freelancer",
        "yearsInCurrentJob": 1,
        "loanAmount": 2000000,
        "loanTenure": 60,
        "loanPurpose": "Personal",
        "existingEMI": 10000,
        "numberOfActiveLoans": 2,
        "numberOfDependents": 1,
        "residentialStatus": "Rented"
    }
    
    print("\n--- Testing Rejected Loan (Expecting Recommendations) ---")
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            res_json = response.json()
            print(f"Status: {res_json['status']}")
            print(f"Creditworthiness Score: {res_json['creditworthiness_score']}")
            print(f"Fraud Risk: {res_json['fraud_detection']['risk_level']}")
            print("Recommendations:")
            for rec in res_json.get('recommendations', []):
                print(f" - {rec}")
            print("\nFormatted Reasoning Sample:")
            print(res_json.get('formatted_reasoning')[:200] + "...")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection Error: {e}")

    # Test a "fraudulent" loan
    fraud_data = {
        "fullName": "Suspicious User",
        "age": 25,
        "income": 500000,
        "creditScore": 750,
        "employmentType": "Salaried",
        "yearsInCurrentJob": 5,
        "loanAmount": 10000000, # 20x income
        "loanTenure": 120,
        "loanPurpose": "Home",
        "existingEMI": 0,
        "numberOfActiveLoans": 0,
        "numberOfDependents": 0,
        "residentialStatus": "Owned"
    }

    print("\n--- Testing Fraudulent Loan (Expecting High Fraud Risk) ---")
    try:
        response = requests.post(url, headers=headers, json=fraud_data)
        if response.status_code == 200:
            res_json = response.json()
            print(f"Status: {res_json['status']}")
            print(f"Fraud Risk: {res_json['fraud_detection']['risk_level']}")
            print(f"Fraud Flags: {res_json['fraud_detection']['flags']}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_api()
