import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

load_dotenv()

def migrate_docs():
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
            return

        print("Migrating document_verifications from AiHdfcLoanApproval...")
        
        # Get from source
        cursor.execute("SELECT * FROM AiHdfcLoanApproval.document_verifications")
        rows = cursor.fetchall()
        
        # Check columns in target
        cursor.execute("USE hdfc_loan_system")
        cursor.execute("DESCRIBE document_verifications")
        target_cols = {c['Field'] for c in cursor.fetchall()}

        for row in rows:
            try:
                # Only keep keys that exist in target
                row_cleaned = {k: v for k, v in row.items() if k in target_cols}
                keys = list(row_cleaned.keys())
                cols = ", ".join(keys)
                placeholders = ", ".join(["%s"] * len(keys))
                sql = f"INSERT IGNORE INTO document_verifications ({cols}) VALUES ({placeholders})"
                cursor.execute(sql, list(row_cleaned.values()))
            except Error as e:
                print(f"Skipping doc row: {e}")
        
        conn.commit()
        cursor.close()
        conn.close()
        print(f"SUCCESS: Migrated {len(rows)} document records.")
    except Error as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    migrate_docs()
