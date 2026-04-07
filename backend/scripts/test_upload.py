import os
from dotenv import load_dotenv
import requests

load_dotenv()

BASE_URL = os.getenv('API_URL', 'http://localhost:5001')
url = f"{BASE_URL}/api/documents/upload"

# Create a dummy file
with open("test_upload.txt", "w") as f:
    f.write("test content")

with open("test_upload.txt", "rb") as f:
    files = {"file": ("test_upload.pdf", f, "application/pdf")}
    data = {
        "user_id": "1",
        "doc_type": "pan_card",
        "doc_name": "test_upload.pdf"
    }
    
    print(f"Sending to {url}...")
    print(f"Form data: {data}")
    print(f"File: test_upload.pdf")
    
    resp = requests.post(url, data=data, files=files)
    
    print(f"\nStatus: {resp.status_code}")
    print(f"Response: {resp.text}")

os.remove("test_upload.txt")
