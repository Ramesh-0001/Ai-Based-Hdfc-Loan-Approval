
import mysql.connector
import os

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'AiHdfcLoanApproval'
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
