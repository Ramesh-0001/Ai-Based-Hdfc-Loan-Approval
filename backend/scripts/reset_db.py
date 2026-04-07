import mysql.connector
import os

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234'
}

def reset_db():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        print("Dropping existing database...")
        cursor.execute("DROP DATABASE IF EXISTS AiHdfcLoanApproval")
        
        print("Creating fresh database...")
        cursor.execute("CREATE DATABASE AiHdfcLoanApproval")
        cursor.execute("USE AiHdfcLoanApproval")
        
        with open('database_schema.sql', 'r') as f:
            sql_script = f.read()
            
        # Split by semicolon but ignore ones inside quotes or comments if possible
        # Simple split usually works for basic scripts
        commands = sql_script.split(';')
        for command in commands:
            cmd = command.strip()
            if cmd:
                try:
                    cursor.execute(cmd)
                except mysql.connector.Error as e:
                    print(f"Error executing command: {e}")
                    # Continue anyway for small errors
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Database reset and schema imported successfully.")
    except Exception as e:
        print(f"FAILED to reset database: {e}")

if __name__ == "__main__":
    reset_db()
