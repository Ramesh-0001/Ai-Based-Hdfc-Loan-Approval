from dotenv import load_dotenv
import mysql.connector
import os

load_dotenv()

db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '1234'),
    'database': os.getenv('DB_NAME', 'AiHdfcLoanApproval')
}

def apply_fix():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        with open('schema_fix.sql', 'r') as f:
            # Read and split by ';'
            commands = f.read().split(';')
            
        for cmd in commands:
            cmd = cmd.strip()
            if not cmd or cmd.startswith('--') or cmd.startswith('USE'):
                continue
            try:
                print(f"Executing: {cmd[:50]}...")
                cursor.execute(cmd)
                print("✅ Success")
            except Exception as e:
                print(f"❌ Error during command: {e}")
        
        conn.commit()
        cursor.close()
        conn.close()
        print("\n🎉 SCHEMA FIX APPLIED SUCCESSFULLY")
    except Exception as e:
        print(f"🔥 FINAL ERROR: {e}")

if __name__ == "__main__":
    apply_fix()
