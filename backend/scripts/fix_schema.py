import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='1234',
    database='AiHdfcLoanApproval'
)
cursor = conn.cursor()

alter_statements = [
    "ALTER TABLE applications ADD COLUMN confidence_score INT DEFAULT 0;",
    "ALTER TABLE applications ADD COLUMN verification_alerts TEXT;",
    "ALTER TABLE applications ADD COLUMN audit_facts TEXT;",
    "ALTER TABLE users ADD COLUMN income DECIMAL(15,2) DEFAULT 0;",
    "ALTER TABLE users ADD COLUMN mobile VARCHAR(20);"
]

for s in alter_statements:
    try:
        cursor.execute(s)
        print(f"Executed: {s}")
    except mysql.connector.Error as err:
        if err.errno == 1060: # Column already exists
            print(f"Skipped: {s} (Already exists)")
        else:
            print(f"Error: {err}")

conn.commit()
cursor.close()
conn.close()
print("Done.")
