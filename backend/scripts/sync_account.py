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

# Set User 1 to match the current browser session's preferred data
cursor.execute("""
    UPDATE users 
    SET full_name = 'Ramesh Kannan',
        income = 97846512,
        mobile = '09385872688'
    WHERE id = 1
""")

conn.commit()
cursor.close()
conn.close()
print("Account data synced.")
