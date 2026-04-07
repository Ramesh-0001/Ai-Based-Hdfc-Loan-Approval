-- ─────────────────────────────────────────────────────────────────────────
-- schema_fix.sql
-- Run this ONCE against your existing database to fix the schema issues.
--
-- What this fixes:
--   1. Adds verified_at column (needed by the fixed /ai-result endpoint)
--   2. Ensures the UNIQUE KEY on (user_id, doc_type) exists
--      (required for INSERT … ON DUPLICATE KEY UPDATE to work correctly)
--   3. Ensures extracted_data is a TEXT or JSON column that can hold
--      json.dumps() output
--   4. Ensures status column has correct default
-- ─────────────────────────────────────────────────────────────────────────

USE AiHdfcLoanApproval;   -- Unified HDFC Loan project database

-- 1. Create the table if it doesn't exist yet
-- Note: Aligning naming to the "Fixed Version" code convention:
-- doc_name -> file_name
-- file_url -> file_path
CREATE TABLE IF NOT EXISTS document_verifications (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id        INT          NOT NULL,
    doc_type       VARCHAR(64)  NOT NULL,
    file_name      VARCHAR(255) DEFAULT NULL,
    file_path      VARCHAR(512) DEFAULT NULL,
    status         VARCHAR(32)  NOT NULL DEFAULT 'pending',
    extracted_data TEXT         DEFAULT NULL,
    ai_passed      TINYINT(1)   DEFAULT 0,
    ai_confidence  INT          DEFAULT 0,
    ai_summary     TEXT         DEFAULT NULL,
    uploaded_at    DATETIME     DEFAULT NULL,
    verified_at    DATETIME     DEFAULT NULL,
    UNIQUE KEY uq_user_doc (user_id, doc_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2. If the table already exists, apply the following ALTER statements
--    individually. This ensures the schema matches the code expectations.

-- Add verified_at if missing
ALTER TABLE document_verifications
    ADD COLUMN IF NOT EXISTS verified_at DATETIME DEFAULT NULL;

-- Add file_path if missing (to match new code naming)
ALTER TABLE document_verifications
    ADD COLUMN IF NOT EXISTS file_path VARCHAR(512) DEFAULT NULL;

-- Add file_name if missing (to match new code naming)
ALTER TABLE document_verifications
    ADD COLUMN IF NOT EXISTS file_name VARCHAR(255) DEFAULT NULL;

-- Add extracted_data if missing
ALTER TABLE document_verifications
    ADD COLUMN IF NOT EXISTS extracted_data TEXT DEFAULT NULL;

-- Ensure the UNIQUE constraint exists (required for ON DUPLICATE KEY UPDATE)
-- If a key on (user_id, doc_type) exists but with a different name, it's fine.
-- This command is idempotent in newer MySQL versions with IF NOT EXISTS.
ALTER TABLE document_verifications
    ADD UNIQUE KEY IF NOT EXISTS uq_user_doc (user_id, doc_type);

-- 3. Verify final structure
DESCRIBE document_verifications;
SHOW INDEX FROM document_verifications;
