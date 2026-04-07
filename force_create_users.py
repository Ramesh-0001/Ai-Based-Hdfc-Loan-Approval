import os
import mysql.connector
from flask_bcrypt import Bcrypt
from flask import Flask
from dotenv import load_dotenv

load_dotenv('backend/.env')

app = Flask(__name__)
bcrypt = Bcrypt(app)

print("Connecting to Aiven DB:", os.getenv('DB_HOST'))
conn = mysql.connector.connect(
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME', 'defaultdb'),
    port=int(os.getenv('DB_PORT', 3306))
)
cursor = conn.cursor()

# Accounts to verify/inject
users = [
    ('admin1', 'admin123', 'System Administrator', 'ADMIN'),
    ('rameshkannan', '1234', 'Ramesh Kannan', 'OFFICER'),
    ('surendran', '1234', 'Surendran', 'OFFICER')
]

for username, raw_password, full_name, role in users:
    hashed = bcrypt.generate_password_hash(raw_password).decode('utf-8')
    
    # First forcefully delete them if they exist to prevent corruption or bad state
    cursor.execute("DELETE FROM users WHERE username = %s", (username,))
    
    # Force insert fresh copy
    cursor.execute(
        "INSERT INTO users (username, password_hash, full_name, role) VALUES (%s, %s, %s, %s)",
        (username, hashed, full_name, role)
    )
    print(f"Forcefully created and encrypted account: {username}")

conn.commit()

# Verify they exist
cursor.execute("SELECT username, role FROM users")
all_users = cursor.fetchall()
print("\nActive accounts on Aiven Database:")
for u in all_users:
    print(f"- {u[0]} (Role: {u[1]})")

print("\nSuccess! Accounts properly instantiated.")
cursor.close()
conn.close()
