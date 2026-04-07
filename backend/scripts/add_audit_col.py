import mysql.connector
from mysql.connector import Error

def add_col():
    try:
        conn = mysql.connector.connect(host='127.0.0.1', user='root', password='1234', database='AiHdfcLoanApproval')
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
