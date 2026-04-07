import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv('backend/.env')

print("Connecting to Aiven DB:", os.getenv('DB_HOST'))
conn = mysql.connector.connect(
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME', 'defaultdb'),
    port=int(os.getenv('DB_PORT', 3306))
)
cursor = conn.cursor(dictionary=True)

cursor.execute("SELECT id, username, password_hash, role FROM users")
users = cursor.fetchall()

print("\n--- Current Users in Aiven ---")
for u in users:
    hash_val = u['password_hash']
    display_hash = hash_val[:10] + "..." if len(hash_val) > 10 else hash_val
    print(f"ID: {u['id']} | User: {u['username']} | Role: {u['role']} | Hash: {display_hash}")

cursor.close()
conn.close()
