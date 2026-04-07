import os
import mysql.connector

db_config = {
    'host':     'localhost', # Try localhost directly for host check
    'user':     'root',
    'password': '1234',
    'database': 'hdfc_loan_system'
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
