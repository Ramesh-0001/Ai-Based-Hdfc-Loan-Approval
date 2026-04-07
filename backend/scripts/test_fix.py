import requests, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = requests.post('http://127.0.0.1:5001/api/predict-loan', json={
    'annual_income': 900000,
    'loan_amount': 1400000,
    'credit_score': 750,
    'employmentType': 'Salaried',
    'age': 32,
    'loanTenure': '60',
    'existingEMI': '0'
}, timeout=15)

print("Status Code:", r.status_code)
print(json.dumps(r.json(), indent=2, ensure_ascii=False))
