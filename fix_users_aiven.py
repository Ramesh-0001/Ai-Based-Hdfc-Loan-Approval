import os
import mysql.connector
from flask_bcrypt import Bcrypt
from flask import Flask
from dotenv import load_dotenv

# Load credentials from root .env
load_dotenv('.env')

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
    # Encrypt explicitly via Bcrypt so backend verify_hash passes
    hashed = bcrypt.generate_password_hash(raw_password).decode('utf-8')
    
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    result = cursor.fetchone()
    
    if result:
        print(f"Updating existing user '{username}' with a properly encrypted Bcrypt password block.")
        cursor.execute("UPDATE users SET password_hash=%s, full_name=%s, role=%s WHERE id=%s", (hashed, full_name, role, result[0]))
    else:
        print(f"Inserting missing user '{username}' directly into Aiven with proper encryption.")
        cursor.execute("INSERT INTO users (username, password_hash, full_name, role) VALUES (%s, %s, %s, %s)", (username, hashed, full_name, role))

conn.commit()
print("\nSuccess! Aiven DB accounts have been securely modernized and loaded. You can now login.")
cursor.close()
conn.close()
