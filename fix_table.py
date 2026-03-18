import mysql.connector

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'hdfc_loan_system'
}

def fix_table():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Add missing columns if they don't exist
        columns_to_add = [
            ("full_name", "VARCHAR(150) AFTER user_id"),
            ("is_fraud", "BOOLEAN DEFAULT FALSE AFTER loan_amount"),
            ("fraud_reason", "TEXT AFTER is_fraud"),
            ("ml_insight", "JSON AFTER fraud_reason"),
            ("ai_reasoning", "JSON AFTER ml_insight"),
            ("score_breakdown", "JSON AFTER ai_reasoning"),
            ("comparison", "JSON AFTER score_breakdown"),
            ("recommendations", "JSON AFTER comparison"),
            ("reviewed_by", "VARCHAR(100) DEFAULT 'HDFC AI Risk Engine' AFTER created_at"),
            ("decision_date", "DATETIME AFTER reviewed_by"),
            ("banker_remark", "TEXT AFTER decision_date"),
            ("is_manual_override", "BOOLEAN DEFAULT FALSE AFTER banker_remark")
        ]
        
        cursor.execute("DESCRIBE applications")
        existing_cols = [row[0] for row in cursor.fetchall()]
        
        for col_name, col_def in columns_to_add:
            if col_name not in existing_cols:
                print(f"Adding column {col_name}...")
                try:
                    cursor.execute(f"ALTER TABLE applications ADD COLUMN {col_name} {col_def}")
                except Exception as e:
                    print(f"Failed to add {col_name}: {e}")
            else:
                print(f"Column {col_name} already exists.")
        
        # Check if 'id' exists vs 'application_id'
        if 'id' not in existing_cols and 'application_id' in existing_cols:
            print("Renaming application_id to id...")
            cursor.execute("ALTER TABLE applications CHANGE application_id id VARCHAR(100)")
            
        conn.commit()
        cursor.close()
        conn.close()
        print("Table 'applications' synchronized.")
    except Exception as e:
        print(f"Error fixing table: {e}")

if __name__ == "__main__":
    fix_table()
