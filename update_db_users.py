import mysql.connector

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'hdfc_loan_system'
}

def update_users():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Admin update
        cursor.execute("UPDATE users SET username='admin1', password_hash='admin123' WHERE username='admin_hdfc' OR role='ADMIN'")
        
        # Officer update
        cursor.execute("UPDATE users SET username='rameshkannan', password_hash='1234' WHERE username='ramesh_kannan' OR full_name LIKE '%Ramesh Kannan%'")
        cursor.execute("UPDATE users SET username='surendran', password_hash='1234' WHERE username='surendran_v' OR full_name LIKE '%Surendran%'")
        
        conn.commit()
        print("Successfully updated the usernames and passwords in the MySQL database!")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error updating database: {e}")

if __name__ == '__main__':
    update_users()
