import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

load_dotenv()

def migrate_users():
    try:
        conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', '1234')
)
        cursor = conn.cursor(dictionary=True)
        
        # Check if source exists
        cursor.execute("SHOW DATABASES LIKE 'AiHdfcLoanApproval'")
        if not cursor.fetchone():
            print("Source database AiHdfcLoanApproval not found. Nothing to migrate.")
            return

        print("Migrating users from AiHdfcLoanApproval to hdfc_loan_system...")
        
        # Get users from source
        cursor.execute("SELECT * FROM AiHdfcLoanApproval.users")
        users = cursor.fetchall()
        
        # Insert into target
        cursor.execute("USE hdfc_loan_system")
        for user in users:
            try:
                cursor.execute("""
                    INSERT IGNORE INTO users (id, username, password_hash, full_name, email, role, status, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (user['id'], user['username'], user['password_hash'], user['full_name'], user['email'], user['role'], user['status'], user['created_at']))
            except Error as e:
                print(f"Skipping user {user['username']}: {e}")
        
        conn.commit()
        cursor.close()
        conn.close()
        print(f"SUCCESS: Migrated {len(users)} users.")
    except Error as e:
        print(f"MIGRATION ERROR: {e}")

if __name__ == "__main__":
    migrate_users()
