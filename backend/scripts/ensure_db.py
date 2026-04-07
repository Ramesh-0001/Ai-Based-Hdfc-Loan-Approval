import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

load_dotenv()

db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '1234'),
    'database': os.getenv('DB_NAME', 'AiHdfcLoanApproval')
}

def ensure_db():
    try:
        conn = mysql.connector.connect(host=db_config['host'], user=db_config['user'], password=db_config['password'])
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_config['database']}")
        cursor.execute(f"USE {db_config['database']}")
        
        # 1. users
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                email VARCHAR(100),
                role ENUM('APPLICANT', 'OFFICER', 'ADMIN') DEFAULT 'APPLICANT',
                status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 2. applications
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id VARCHAR(50) PRIMARY KEY,
                applicant_id INT,
                full_name VARCHAR(100),
                mobile VARCHAR(20),
                email VARCHAR(100),
                age INT,
                income DECIMAL(15,2),
                employment_type VARCHAR(50),
                credit_score INT,
                existing_loan_count INT,
                repayment_history VARCHAR(50),
                job_tenure DECIMAL(5,2),
                loan_amount DECIMAL(15,2),
                loan_purpose VARCHAR(100),
                tenure INT,
                status VARCHAR(20) DEFAULT 'PENDING',
                risk_level VARCHAR(20) DEFAULT 'Medium',
                ai_creditworthiness INT,
                ml_confidence DECIMAL(5,4),
                ai_reasoning TEXT,
                score_breakdown TEXT,
                ml_insight TEXT,
                comparison TEXT,
                recommendations TEXT,
                banker_remark TEXT,
                reviewed_by VARCHAR(100),
                decision_date DATETIME,
                is_fraud BOOLEAN DEFAULT FALSE,
                fraud_reason TEXT,
                is_manual_override BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (applicant_id) REFERENCES users(id)
            )
        """)

        # 3. document_verifications
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS document_verifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                doc_type VARCHAR(50) NOT NULL,
                doc_name VARCHAR(255),
                status ENUM('Not Submitted', 'AI Processing', 'Verified', 'Rejected', 'Pending Manual Review') DEFAULT 'Not Submitted',
                ai_passed BOOLEAN DEFAULT NULL,
                ai_confidence INT DEFAULT NULL,
                ai_summary TEXT,
                rejection_reason TEXT,
                reviewed_by VARCHAR(100),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_doc (user_id, doc_type),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # 4. Alter to add missing columns
        alter_statements = [
            "ALTER TABLE document_verifications MODIFY COLUMN doc_type VARCHAR(50) NOT NULL;",
            "ALTER TABLE document_verifications ADD COLUMN extracted_data TEXT;",
            "ALTER TABLE document_verifications ADD COLUMN file_url VARCHAR(255);",
            "ALTER TABLE applications ADD COLUMN fraud_risk VARCHAR(50) DEFAULT 'Low';",
            "ALTER TABLE applications ADD COLUMN fraud_flags TEXT;",
            "ALTER TABLE applications ADD COLUMN fraud_score INT DEFAULT 0;",
            "ALTER TABLE applications ADD COLUMN pan_number VARCHAR(20);",
            "ALTER TABLE applications ADD COLUMN aadhar_number VARCHAR(20);",
            "ALTER TABLE applications ADD COLUMN confidence_score INT DEFAULT 0;"
        ]
        
        for statement in alter_statements:
            try:
                cursor.execute(statement)
            except Error as e:
                if e.errno != 1060: # ignore duplicate column
                    print(f"Alter Table Error: {e}")

        conn.commit()
        cursor.close()
        conn.close()
        print("SUCCESS: All tables ensured.")
    except Error as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    ensure_db()
