from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()

db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '1234'),
    'database': os.getenv('DB_NAME', 'AiHdfcLoanApproval')
}

def check_db():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM applications")
        count = cursor.fetchone()[0]
        print(f"SUCCESS: Found {count} applications in the database.")
        conn.close()
    except Exception as e:
        print(f"FAILURE: Cannot connect to database. Error: {e}")

if __name__ == "__main__":
    check_db()
