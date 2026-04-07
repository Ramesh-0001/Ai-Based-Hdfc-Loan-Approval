import os
from dotenv import load_dotenv
import mysql.connector
import json

load_dotenv()

try:
    conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', '1234'),
    database=os.getenv('DB_NAME', 'AiHdfcLoanApproval')
)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users;")
    rows = cursor.fetchall()
    print("ALL USERS:")
    print(json.dumps(rows, indent=2, default=str))
    
    cursor.execute("SELECT * FROM document_verifications;")
    rows = cursor.fetchall()
    print("\nDOCUMENTS:")
    print(json.dumps(rows, indent=2, default=str))
    cursor.close()
    conn.close()
except Exception as e:
    print(f"ERROR: {e}")
