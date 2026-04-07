-- AI-Based HDFC Loan Approval System
-- Database Schema (MySQL)
-- Version: 1.0 (RBAC & Audit Compliant)

CREATE DATABASE IF NOT EXISTS AiHdfcLoanApproval;
USE AiHdfcLoanApproval;

-- 1. Users Table (Identity & RBAC)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    role ENUM('APPLICANT', 'OFFICER', 'ADMIN') NOT NULL,
    status ENUM('ACTIVE', 'LOCKED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- 2. Loan Applications Table (Core Data + AI Insights)
CREATE TABLE applications (
    id VARCHAR(50) PRIMARY KEY,
    applicant_id BIGINT COMMENT 'Support for large numeric identifier chains',
    
    -- Applicant Profile Data
    full_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20),
    age INT,
    income DECIMAL(15, 2) NOT NULL,
    loan_amount DECIMAL(15, 2) NOT NULL,
    credit_score INT NOT NULL,
    employment_type VARCHAR(50),
    loan_purpose VARCHAR(100),
    tenure INT COMMENT 'Tenure in months',
    existing_loan_count INT DEFAULT 0,
    existing_emis DECIMAL(15, 2),
    job_tenure DECIMAL(5, 2),
    experience DECIMAL(5, 2),
    residential_status VARCHAR(50),
    dependents INT,
    
    -- AI/ML Insight Fields (JSON for rich dashboard data)
    ai_creditworthiness INT COMMENT 'Rule-based safety score (0-100)',
    risk_level VARCHAR(50),
    risk_category VARCHAR(50),
    ml_confidence DECIMAL(5, 2) COMMENT 'ML model confidence %',
    ml_insight JSON COMMENT 'Stores prediction, probability, and advice',
    
    -- Fraud Detection Logic
    is_fraud BOOLEAN DEFAULT FALSE,
    fraud_risk_score INT,
    fraud_reason TEXT,
    
    -- Reasoning & Explanations
    ai_reasoning JSON COMMENT 'List of reasons for approval/rejection',
    score_breakdown JSON COMMENT 'Points assigned to each financial category',
    comparison JSON COMMENT 'Conflict detection between Rule vs ML',
    recommendations JSON COMMENT 'Suggested alternatives for rejected loans',
    
    -- Workflow Status
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(100) DEFAULT 'HDFC AI Risk Engine',
    decision_date DATETIME,
    banker_remark TEXT,
    is_manual_override BOOLEAN DEFAULT FALSE,
    
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- 3. Notification Center
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    target_role ENUM('APPLICANT', 'OFFICER', 'ADMIN'),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'GENERAL',
    application_id VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_notif (user_id, is_read)
) ENGINE=InnoDB;

-- 4. Audit Ledger (Decision History)
CREATE TABLE application_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL,
    officer_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    rejection_reason TEXT,
    is_manual_override BOOLEAN DEFAULT FALSE,
    decision_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (officer_id) REFERENCES users(id),
    INDEX idx_app_history (application_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- SAMPLE QUERIES & REPORTS
-- ---------------------------------------------------------

-- 1. Admin Report: Full Application Audit Trail with Officer Details
-- Purpose: View who approved/rejected what, when, and if they overrode the AI.

/*
SELECT 
    a.id AS AppID,
    u.full_name AS ApplicantName,
    a.loan_amount AS Amount,
    a.ai_risk_category AS AIRisk,
    a.ai_recommendation AS AIAdvice,
    h.action AS FinalDecision,
    off.full_name AS ReviewingOfficer,
    h.rejection_reason AS Remark,
    h.is_manual_override AS Override,
    h.decision_timestamp AS DecisionDate
FROM applications a
JOIN users u ON a.applicant_id = u.id
JOIN application_history h ON a.id = h.application_id
JOIN users off ON h.officer_id = off.id
ORDER BY h.decision_timestamp DESC;
*/

-- 2. Officer Performance Report (Aggregation)
/*
SELECT 
    off.full_name AS Officer,
    COUNT(h.id) AS TotalReviews,
    SUM(CASE WHEN h.is_manual_override = 1 THEN 1 ELSE 0 END) AS TotalOverrides,
    (SUM(CASE WHEN h.is_manual_override = 1 THEN 1 ELSE 0 END) / COUNT(h.id)) * 100 AS OverrideRatePercentage
FROM users off
LEFT JOIN application_history h ON off.id = h.officer_id
WHERE off.role = 'OFFICER'
GROUP BY off.id;
*/

-- ---------------------------------------------------------
-- INSERTION QUERIES (Sample Data for Setup)
-- ---------------------------------------------------------

-- 1. Setup Internal Users
-- Note: In production, passwords must be hashed.
INSERT INTO users (username, password_hash, full_name, role) VALUES 
('admin1', 'admin123', 'System Administrator', 'ADMIN'),
('rameshkannan', '1234', 'Ramesh Kannan', 'OFFICER'),
('surendran', '1234', 'Surendran', 'OFFICER'),
('arun_kumar', 'pbkdf2:sha256:260000$applicant_salt$hashed_pass', 'Arun Kumar', 'APPLICANT');

-- 2. Insert a Sample Loan Application
INSERT INTO applications (
    applicant_id, loan_amount, income, credit_score, 
    existing_emi, dependents, tenure, 
    ai_risk_score, ai_risk_category, ai_recommendation, status
) VALUES (
    4, -- Refers to Arun Kumar
    2500000.00, 850000.00, 780, 
    15000.00, 2, 240,
    15.5, 'Low', 'APPROVE', 'APPROVED'
);

-- 3. Log the Decision in History (Audit Trail)
INSERT INTO application_history (application_id, officer_id, action, rejection_reason)
VALUES (1, 2, 'APPROVED', 'Strong financial profile and high credit score');

-- 4. Add a System Notification
INSERT INTO notifications (user_id, message, is_read)
VALUES (4, 'Your Loan Application (ID: 1) has been approved!', FALSE);

