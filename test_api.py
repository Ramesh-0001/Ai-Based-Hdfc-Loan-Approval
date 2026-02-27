import requests
import json

# Test 1: Health Check
print("=" * 60)
print("TEST 1: Health Check")
print("=" * 60)
try:
    response = requests.get('http://localhost:5001/api/health')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("[OK] Health check PASSED\n")
except Exception as e:
    print(f"[FAIL] Health check FAILED: {e}\n")

# Test 2: Loan Prediction (Good Application)
print("=" * 60)
print("TEST 2: Loan Prediction - SHOULD BE APPROVED")
print("=" * 60)
application = {
    "fullName": "Test User",
    "age": 32,
    "income": 900000,
    "creditScore": 760,
    "employmentType": "Salaried",
    "yearsInCurrentJob": 5,
    "loanAmount": 2000000,
    "loanTenure": 240,  # 20 years - key for approval!
    "loanPurpose": "Home",
    "existingEMI": 5000,
    "numberOfActiveLoans": 1,
    "numberOfDependents": 1,
    "residentialStatus": "Rented"
}

try:
    response = requests.post(
        'http://localhost:5001/api/predict-loan',
        json=application,
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"\nDecision: {result.get('status')}")
    print(f"Risk Score: {result.get('confidence')}")
    print(f"\nReasoning:\n{result.get('reasoning')}")
    
    if result.get('status') == 'APPROVED':
        print("\n[OK] Prediction test PASSED - Application APPROVED as expected")
    else:
        print(f"\n[FAIL] Prediction test FAILED - Expected APPROVED, got {result.get('status')}")
except Exception as e:
    print(f"[FAIL] Prediction test FAILED: {e}")

print("\n" + "=" * 60)
print("API VERIFICATION COMPLETE")
print("=" * 60)
