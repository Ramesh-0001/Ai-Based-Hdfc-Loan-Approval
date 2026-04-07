import os
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', '1234'),
    database=os.getenv('DB_NAME', 'AiHdfcLoanApproval')
)
cursor = conn.cursor()

# Add 'type' column if not exists
try:
    cursor.execute("ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT 'GENERAL'")
    print("✅ Added 'type' column to notifications")
except mysql.connector.Error as e:
    print(f"ℹ️  type column: {e}")

# Add 'application_id' column if not exists
try:
    cursor.execute("ALTER TABLE notifications ADD COLUMN application_id VARCHAR(50) DEFAULT NULL")
    print("✅ Added 'application_id' column to notifications")
except mysql.connector.Error as e:
    print(f"ℹ️  application_id column: {e}")

conn.commit()
cursor.close()
conn.close()
print("✅ Migration complete.")
