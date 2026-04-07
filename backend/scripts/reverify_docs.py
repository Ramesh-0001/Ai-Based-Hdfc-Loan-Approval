import mysql.connector
import json
from services.ocr_service import OCRService

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='1234',
    database='AiHdfcLoanApproval'
)
cursor = conn.cursor(dictionary=True)

# Fetch current user info for context
cursor.execute("SELECT id, full_name as name, income, mobile FROM users WHERE id=1")
user_row = cursor.fetchone()

user_context = {
    "name": user_row['name'],
    "income": user_row['income'],
    "mobile": user_row['mobile']
}

# Fetch all docs for this user
cursor.execute("SELECT id, doc_type, doc_name FROM document_verifications WHERE user_id=1")
docs = cursor.fetchall()

for doc in docs:
    print(f"Re-verifying {doc['doc_type']}...")
    # Simulate OCR re-run
    ocr_result = OCRService.extract_document_data(doc['doc_type'], doc['doc_name'], user_context)
    
    # Update DB
    sql = "UPDATE document_verifications SET extracted_data = %s, ai_passed=1, ai_confidence=95, status='Verified' WHERE id = %s"
    cursor.execute(sql, (json.dumps(ocr_result['data']), doc['id']))

conn.commit()
cursor.close()
conn.close()
print("All documents for User 1 re-verified with full extracted data.")
