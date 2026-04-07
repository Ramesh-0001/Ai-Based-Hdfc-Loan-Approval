import mysql.connector
from mysql.connector import Error

def add_fraud_columns():
    try:
        conn = mysql.connector.connect(
            host='127.0.0.1',
            user='root',
            password='1234',
            database='AiHdfcLoanApproval'
        )
        cursor = conn.cursor()
        
        columns = [
            ('fraud_score', 'INT DEFAULT 0'),
            ('confidence_score', 'INT DEFAULT 50'),
            ('verification_alerts', 'TEXT')
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
    add_fraud_columns()
