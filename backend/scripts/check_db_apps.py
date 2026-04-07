from dotenv import load_dotenv

import mysql.connector
import os

load_dotenv()

db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '1234'),
    'database': os.getenv('DB_NAME', 'AiHdfcLoanApproval')
}

def check_apps():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, full_name, ai_creditworthiness, created_at FROM applications ORDER BY created_at DESC LIMIT 5")
        rows = cursor.fetchall()
        for row in rows:
            print(f"ID: {row['id']}, Name: {row['full_name']}, Score: {row['ai_creditworthiness']}, Created: {row['created_at']}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_apps()
