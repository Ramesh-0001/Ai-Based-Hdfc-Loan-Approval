import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='1234', database='AiHdfcLoanApproval', connect_timeout=5)
c = conn.cursor()

# 1. Users Table
c.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    role ENUM('APPLICANT', 'OFFICER', 'ADMIN') NOT NULL,
    status ENUM('ACTIVE', 'LOCKED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role (role)
) ENGINE=InnoDB
""")
print("Created: users")

# 2. Applications Table
c.execute("""
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(50) PRIMARY KEY,
    applicant_id INT,
    full_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20),
    age INT,
    income DECIMAL(15, 2) NOT NULL,
    loan_amount DECIMAL(15, 2) NOT NULL,
    credit_score INT NOT NULL,
    employment_type VARCHAR(50),
    loan_purpose VARCHAR(100),
    tenure INT,
    existing_loan_count INT DEFAULT 0,
    existing_emis DECIMAL(15, 2),
    job_tenure DECIMAL(5, 2),
    experience DECIMAL(5, 2),
    residential_status VARCHAR(50),
    dependents INT,
    ai_creditworthiness INT,
    risk_level VARCHAR(50),
    risk_category VARCHAR(50),
    ml_confidence DECIMAL(5, 2),
    ml_insight JSON,
    is_fraud BOOLEAN DEFAULT FALSE,
    fraud_risk_score INT,
    fraud_reason TEXT,
    ai_reasoning JSON,
    score_breakdown JSON,
    comparison JSON,
    recommendations JSON,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(100) DEFAULT 'HDFC AI Risk Engine',
    decision_date DATETIME,
    banker_remark TEXT,
    is_manual_override BOOLEAN DEFAULT FALSE,
    INDEX idx_status (status)
) ENGINE=InnoDB
""")
print("Created: applications")

# 3. Notifications Table
c.execute("""
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    target_role ENUM('APPLICANT', 'OFFICER', 'ADMIN'),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'GENERAL',
    application_id VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_notif (user_id, is_read)
) ENGINE=InnoDB
""")
print("Created: notifications")

# 4. Application History Table
c.execute("""
CREATE TABLE IF NOT EXISTS application_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL,
    officer_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    rejection_reason TEXT,
    is_manual_override BOOLEAN DEFAULT FALSE,
    decision_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_app_history (application_id)
) ENGINE=InnoDB
""")
print("Created: application_history")

# 5. Insert default users (Updated as per user requirement)
c.execute("DELETE FROM users WHERE username IN ('admin1', 'admin', 'rameshkannan', 'surendran')") # Clean up old defaults
c.execute("""
INSERT INTO users (username, password_hash, full_name, role) VALUES 
('admin', 'admin123', 'System Administrator', 'ADMIN'),
('rameshkannan', '1234', 'Ramesh Kannan', 'OFFICER'),
('surendran', '1234', 'Surendran', 'OFFICER')
""")
print("Inserted: default users")

conn.commit()
c.close()
conn.close()
print("\nDatabase setup complete!")
