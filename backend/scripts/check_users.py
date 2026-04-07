import os
from dotenv import load_dotenv

import mysql.connector
from mysql.connector import Error

load_dotenv()

db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '1234'),
    'database': os.getenv('DB_NAME', 'AiHdfcLoanApproval')
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
