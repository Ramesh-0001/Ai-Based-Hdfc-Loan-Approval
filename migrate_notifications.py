import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='1234', database='hdfc_loan_system')
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
