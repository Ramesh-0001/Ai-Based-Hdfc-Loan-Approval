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
    cursor.execute('SELECT full_name, ml_insight FROM applications ORDER BY created_at DESC LIMIT 1')
    row = cursor.fetchone()
    print("NAME:", row['full_name'])
    data = json.loads(row['ml_insight'])
    print("INSIGHT:", json.dumps(data, indent=2))
except Exception as e:
    print("ERROR:", e)
