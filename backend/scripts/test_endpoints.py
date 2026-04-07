import os
from dotenv import load_dotenv
import requests

load_dotenv()

BASE_URL = os.getenv('API_URL', 'http://localhost:5001')

urls = [
    f'{BASE_URL}/',
    f'{BASE_URL}/api/dashboard-stats',
    f'{BASE_URL}/api/applications'
]

for url in urls:
    try:
        r = requests.get(url)
        print(f"GET {url} -> {r.status_code}")
        if r.status_code == 500:
            print(r.text)
    except Exception as e:
        print(f"FAILED {url} -> {e}")
