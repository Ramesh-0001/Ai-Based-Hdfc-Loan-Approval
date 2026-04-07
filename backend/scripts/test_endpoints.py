import requests

urls = [
    'http://localhost:5001/',
    'http://localhost:5001/api/dashboard-stats',
    'http://localhost:5001/api/applications'
]

for url in urls:
    try:
        r = requests.get(url)
        print(f"GET {url} -> {r.status_code}")
        if r.status_code == 500:
            print(r.text)
    except Exception as e:
        print(f"FAILED {url} -> {e}")
