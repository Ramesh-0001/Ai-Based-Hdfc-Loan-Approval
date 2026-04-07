
import mysql.connector

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'AiHdfcLoanApproval'
}

def check_apps():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, full_name, ai_creditworthiness, loan_amount, income, created_at FROM applications ORDER BY created_at DESC LIMIT 5")
        rows = cursor.fetchall()
        print(f"{'ID':<20} | {'Name':<20} | {'Score':<5} | {'Amount':<10} | {'Income':<10}")
        print("-" * 75)
        for row in rows:
            print(f"{str(row['id']):<20} | {str(row['full_name']):<20} | {str(row['ai_creditworthiness']):<5} | {str(row['loan_amount']):<10} | {str(row['income']):<10}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_apps()
