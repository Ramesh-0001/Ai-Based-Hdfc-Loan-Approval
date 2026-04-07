import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

load_dotenv()

def add_col():
    try:
        conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', '1234'),
    database=os.getenv('DB_NAME', 'AiHdfcLoanApproval')
)
        cursor = conn.cursor()
        try:
            cursor.execute("ALTER TABLE applications ADD COLUMN audit_facts TEXT")
            conn.commit()
            print("Added audit_facts")
        except Error as e:
            if e.errno == 1060: print("Already exists")
            else: print(f"Error: {e}")
    except Error as e: print(e)
    finally: conn.close()

if __name__ == "__main__": add_col()
