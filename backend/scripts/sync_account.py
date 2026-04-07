import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='1234',
    database='AiHdfcLoanApproval'
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
