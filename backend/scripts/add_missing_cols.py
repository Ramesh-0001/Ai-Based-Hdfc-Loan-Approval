import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

load_dotenv()

def add_columns():
    try:
        conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', '1234'),
    database=os.getenv('DB_NAME', 'AiHdfcLoanApproval')
)
        cursor = conn.cursor()
        
        columns = [
            ('college_name', 'VARCHAR(255)'),
            ('course_name', 'VARCHAR(255)'),
            ('coApplicantName', 'VARCHAR(255)'),
            ('coApplicantIncome', 'DECIMAL(15,2)')
        ]
        
        for col, dtype in columns:
            try:
                cursor.execute(f"ALTER TABLE applications ADD COLUMN {col} {dtype}")
                conn.commit()
                print(f"Added column {col}")
            except Error as e:
                if e.errno == 1060: # Column already exists
                    print(f"Column {col} already exists")
                else:
                    print(f"Error adding {col}: {e}")
        
    except Error as e:
        print(f"Connection failed: {e}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    add_columns()
