import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

load_dotenv()

def migrate_apps():
    try:
        conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', '1234')
)
        cursor = conn.cursor(dictionary=True)
        
        # Check targets
        cursor.execute("USE hdfc_loan_system")
        cursor.execute("DESCRIBE applications")
        target_cols = {c['Field'] for c in cursor.fetchall()}

        # Get apps from source
        cursor.execute("SELECT * FROM AiHdfcLoanApproval.applications")
        apps = cursor.fetchall()
        
        print(f"Starting migration of {len(apps)} applications...")
        
        count = 0
        for app in apps:
            try:
                # Filter to existing columns only
                app_cleaned = {k: v for k, v in app.items() if k in target_cols}
                keys = list(app_cleaned.keys())
                cols = ", ".join(keys)
                placeholders = ", ".join(["%s"] * len(keys))
                sql = f"INSERT IGNORE INTO applications ({cols}) VALUES ({placeholders})"
                cursor.execute(sql, list(app_cleaned.values()))
                if cursor.rowcount > 0: count += 1
            except Error as e:
                print(f"Skipping application {app['id']}: {e}")
        
        conn.commit()
        cursor.close()
        conn.close()
        print(f"SUCCESS: Migrated {count} applications.")
    except Error as e:
        print(f"MIGRATION ERROR: {e}")

if __name__ == "__main__":
    migrate_apps()
