import os
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

try:
    conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', '1234'),
    database=os.getenv('DB_NAME', 'AiHdfcLoanApproval')
)
    cursor = conn.cursor()
    cursor.execute('DESCRIBE applications')
    print(f"{'Field':<25} | {'Type':<15} | {'Null':<5} | {'Key':<5} | {'Default':<10}")
    print("-" * 70)
    for row in cursor:
        print(f"{row[0]:<25} | {row[1]:<15} | {row[2]:<5} | {row[3]:<5} | {str(row[4]):<10}")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
