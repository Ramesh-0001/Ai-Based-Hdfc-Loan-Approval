import mysql.connector
import json

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='1234',
        database='AiHdfcLoanApproval'
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
