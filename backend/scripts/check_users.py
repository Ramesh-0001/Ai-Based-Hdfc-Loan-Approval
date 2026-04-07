
import mysql.connector
from mysql.connector import Error

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'hdfc_loan_system'
}

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT username, password_hash, full_name, role FROM users")
    users = cursor.fetchall()
    print("User List:")
    for user in users:
        print(f"Role: {user['role']}, Username: {user['username']}, Password Hash: {user['password_hash']}")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
