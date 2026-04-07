"""Simulate a real frontend upload to catch the exact 500 error."""
import requests

url = "http://localhost:5001/api/documents/upload"

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

import os
os.remove("test_upload.txt")
