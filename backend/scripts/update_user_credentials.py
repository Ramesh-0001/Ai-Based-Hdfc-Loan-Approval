import mysql.connector
from mysql.connector import Error

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'AiHdfcLoanApproval'
}

def ensure_users():
    try:
        conn = mysql.connector.connect(**db_config)
        if conn.is_connected():
            cursor = conn.cursor()
            
            users_to_add = [
                ('rameshkannan', '1234', 'Ramesh Kannan', 'ramesh@hdfc.com', 'OFFICER'),
                ('surendran', '1234', 'Surendran', 'surendran@hdfc.com', 'OFFICER'),
                ('admin', 'admin123', 'System Administrator', 'admin@hdfc.com', 'ADMIN')
            ]
            
            for username, password, full_name, email, role in users_to_add:
                # Check if user exists
                cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
                user = cursor.fetchone()
                
                if user:
                    # Update existing user
                    print(f"Updating user: {username}")
                    cursor.execute("""
                        UPDATE users 
                        SET password_hash = %s, full_name = %s, email = %s, role = %s 
                        WHERE username = %s
                    """, (password, full_name, email, role, username))
                else:
                    # Insert new user
                    print(f"Creating user: {username}")
                    cursor.execute("""
                        INSERT INTO users (username, password_hash, full_name, email, role)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (username, password, full_name, email, role))
            
            conn.commit()
            print("\nSuccessfully updated user credentials!")
            cursor.close()
            conn.close()
            
    except Error as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    ensure_users()
