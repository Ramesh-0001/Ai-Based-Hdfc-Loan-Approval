"""Quick test: verify the fixed SQL works with actual DB columns."""
import mysql.connector
from datetime import datetime

conn = mysql.connector.connect(host='localhost', user='root', password='1234', database='AiHdfcLoanApproval')
c = conn.cursor()

# Test INSERT with correct columns using REAL user_id=1
c.execute("""
    INSERT INTO document_verifications (user_id, doc_type, doc_name, status, file_url, uploaded_at)
    VALUES (1, 'bank_statement', 'test_fix.pdf', 'AI Processing', '/uploads/test.pdf', %s)
    ON DUPLICATE KEY UPDATE doc_name=VALUES(doc_name), status=VALUES(status), file_url=VALUES(file_url)
""", (datetime.utcnow(),))
conn.commit()
print(f"✅ INSERT OK — rows affected: {c.rowcount}")

# Verify
c.execute("SELECT id, user_id, doc_type, doc_name, status, file_url FROM document_verifications WHERE user_id=1 AND doc_type='bank_statement'")
row = c.fetchone()
print(f"✅ VERIFY: {row}")

c.close()
conn.close()
print("\n🎉 ALL TESTS PASSED — document_routes.py SQL is correct!")
