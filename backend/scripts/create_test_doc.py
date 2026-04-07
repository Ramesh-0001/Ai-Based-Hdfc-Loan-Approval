import os
from dotenv import load_dotenv
import mysql.connector
import json

load_dotenv()

conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', '1234'),
    database=os.getenv('DB_NAME', 'AiHdfcLoanApproval')
)
cursor = conn.cursor()

extracted_data = {
    "full_name": "Test User",
    "income": 900000,
    "mobile": "9876543210"
}

sql = """
INSERT INTO document_verifications 
    (user_id, doc_type, doc_name, status, file_url, ai_passed, ai_confidence, ai_summary, extracted_data)
VALUES 
    (%s, %s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE status="Verified", extracted_data=%s
"""
params = (1, "id_proof", "test.pdf", "Verified", "/uploads/test.pdf", 1, 95, "Summary", json.dumps(extracted_data), json.dumps(extracted_data))

cursor.execute(sql, params)
conn.commit()
cursor.close()
conn.close()
print("Doc created.")
