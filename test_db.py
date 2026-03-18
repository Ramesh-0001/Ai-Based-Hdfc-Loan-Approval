import mysql.connector
import json

try:
    conn = mysql.connector.connect(host='localhost', user='root', password='1234', database='AiHdfcLoanApproval')
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT full_name, ml_insight FROM applications ORDER BY created_at DESC LIMIT 1')
    row = cursor.fetchone()
    print("NAME:", row['full_name'])
    data = json.loads(row['ml_insight'])
    print("INSIGHT:", json.dumps(data, indent=2))
except Exception as e:
    print("ERROR:", e)
