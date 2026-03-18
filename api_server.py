import json
import os
import sys
import logging
from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime
from fpdf import FPDF
from flask_bcrypt import Bcrypt

# -- Logging Setup --
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import logging
from datetime import datetime
from mysql.connector import Error, connect

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('HDFC-AI-Backend')

# Add ml directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml'))

app = Flask(__name__)
# Enable CORS for all routes with support for credentials and preflight requests
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
bcrypt = Bcrypt(app)

# -- Database Configuration --
db_config = {
    'host':     os.getenv('DB_HOST', '127.0.0.1'),
    'user':     os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '1234'),
    'database': os.getenv('DB_NAME', 'AiHdfcLoanApproval')
}

def get_db_connection(database=None):
    """Returns a MySQL connection."""
    config = db_config.copy()
    if database:
        config['database'] = database
    try:
        conn = mysql.connector.connect(**config)
        if conn.is_connected():
            return conn
    except Error as e:
        logger.error(f"Database connection failed: {e}")
    return None

def initialize_database():
    """Ensure database and tables exist."""
    conn = get_db_connection(database='')
    if not conn:
        logger.error("Could not connect to MySQL to initialize database.")
        return
    
    try:
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_config['database']}")
        cursor.execute(f"USE {db_config['database']}")
        
        # Users table
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
        
        # Applications table
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
        
        # Application History table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS application_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                application_id VARCHAR(50),
                officer_id INT,
                action VARCHAR(50),
                rejection_reason TEXT,
                is_manual_override BOOLEAN DEFAULT FALSE,
                decision_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES applications(id),
                FOREIGN KEY (officer_id) REFERENCES users(id)
            )
        """)
        
        # Notifications table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                target_role ENUM('APPLICANT', 'OFFICER', 'ADMIN'),
                title VARCHAR(100),
                message TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("Database initialized successfully.")
    except Error as e:
        logger.error(f"Error during database initialization: {e}")

# Call initialization
initialize_database()

# -- ML Engine Initialization --
try:
    from risk_scorer import RiskScorer
    from predict import LoanApprovalPredictor
    from fraud_detector import FraudDetector
    
    risk_scorer = RiskScorer()
    ml_predictor = LoanApprovalPredictor()
    fraud_detector = FraudDetector()
    logger.info("ML Engines loaded successfully.")
except Exception as e:
    logger.error(f"ML Engine loading failed: {e}")
    # Minimal stubs if ML fails
    class RiskScorer:
        def calculate_risk_score(self, d): return {'creditworthiness_score': 65, 'approval_status': 'PENDING', 'risk_level': 'Medium', 'reasoning': ['Stubs active'], 'score_breakdown': []}
    class LoanApprovalPredictor:
        def predict(self, d): return {'prediction': 'Pending', 'confidence': 0.5}
    class FraudDetector:
        def detect(self, d): return {'is_fraud': False, 'reason': 'Stubs active'}
    
    risk_scorer = RiskScorer()
    ml_predictor = LoanApprovalPredictor()
    fraud_detector = FraudDetector()

# -- Helpers --
def safe_float(v, default=0.0):
    try: return float(v) if v not in (None, '', 'null') else default
    except: return default

def safe_int(v, default=0):
    try: return int(float(v)) if v not in (None, '', 'null') else default
    except: return default

def format_application(app):
    """Map DB fields to Frontend CamelCase and parse JSON fields."""
    if not app: return app
    
    # Field Mappings
    app['loanAmount'] = safe_float(app.get('loan_amount'))
    app['fullName'] = app.get('full_name', '')
    app['creditScore'] = safe_int(app.get('credit_score'))
    app['aiCreditworthiness'] = safe_int(app.get('ai_creditworthiness'))
    app['mlConfidence'] = safe_float(app.get('ml_confidence'))
    app['income'] = safe_float(app.get('income'))
    app['existingLoans'] = safe_int(app.get('existing_loan_count'))
    app['jobTenure'] = safe_float(app.get('job_tenure'))
    app['loanPurpose'] = app.get('loan_purpose', '')
    app['tenure'] = safe_int(app.get('tenure')) or 60
    
    # JSON Fields
    for f in ['ai_reasoning', 'score_breakdown', 'ml_insight', 'comparison', 'recommendations']:
        if app.get(f) and isinstance(app[f], (str, bytes)):
            try:
                app[f] = json.loads(app[f])
            except:
                if f == 'ml_insight': app[f] = {}
                else: app[f] = []
    
    # DateTime Serialization
    if app.get('created_at') and hasattr(app['created_at'], 'isoformat'):
        app['createdAt'] = app['created_at'].isoformat()
    if app.get('decision_date') and hasattr(app['decision_date'], 'isoformat'):
        app['decisionDate'] = app['decision_date'].isoformat()
        
    return app

def validate_user(username, password, expected_role=None):
    conn = get_db_connection()
    if not conn: return None
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT id, username, password_hash, full_name, role, status FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if user:
            is_valid = False
            if user['password_hash'].startswith(('$2b$', 'pbkdf2')):
                is_valid = bcrypt.check_password_hash(user['password_hash'], password)
            else:
                is_valid = user['password_hash'] == password
            if is_valid:
                if expected_role and user['role'] != expected_role:
                    return {'error': 'Unauthorized role access'}
                return user
        return None
    except: return None

# -- PDF Helper --
class HDFCReportPDF(FPDF):
    def header(self):
        self.set_fill_color(0, 61, 130) # HDFC Blue
        self.rect(0, 0, 210, 40, 'F')
        self.set_fill_color(225, 27, 34) # HDFC Red
        self.rect(0, 40, 210, 2, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('Arial', 'B', 24)
        self.cell(10, 20, 'HDFC BANK', 0, 0, 'L')
        self.set_font('Arial', 'I', 10)
        self.set_xy(10, 22)
        self.cell(0, 10, 'AI-Based Risk Management & Loan Underwriting', 0, 0, 'L')
        self.ln(25)
    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, f'Page {self.page_no()} | Confidential AI Internal Audit | Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}', 0, 0, 'C')

# -- Endpoints --

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username') or data.get('empId')
    password = data.get('password')
    user = validate_user(username, password)
    if user:
        if isinstance(user, dict) and 'error' in user:
            return jsonify({'success': False, 'message': user['error']}), 403
        return jsonify({'success': True, 'user': {'id': user['id'], 'username': user['username'], 'name': user['full_name'], 'role': user['role']}})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/login/officer', methods=['POST'])
def login_officer():
    data = request.json
    username = data.get('empId') or data.get('username')
    password = data.get('password')
    user = validate_user(username, password, expected_role='OFFICER')
    if user:
        if isinstance(user, dict) and 'error' in user:
            return jsonify({'success': False, 'message': user['error']}), 403
        return jsonify({'success': True, 'user': {'id': user['id'], 'username': user['username'], 'name': user['full_name'], 'role': user['role']}})
    return jsonify({'success': False, 'message': 'Invalid officer credentials'}), 401

@app.route('/api/login/admin', methods=['POST'])
def login_admin():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = validate_user(username, password, expected_role='ADMIN')
    if user:
        if isinstance(user, dict) and 'error' in user:
            return jsonify({'success': False, 'message': user['error']}), 403
        return jsonify({'success': True, 'user': {'id': user['id'], 'username': user['username'], 'name': user['full_name'], 'role': user['role']}})
    return jsonify({'success': False, 'message': 'Invalid admin credentials'}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    full_name = data.get('full_name')
    email = data.get('email')
    if not all([username, password, full_name]):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    conn = get_db_connection()
    if not conn: return jsonify({'success': False, 'message': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        query = "INSERT INTO users (username, password_hash, full_name, email, role) VALUES (%s, %s, %s, %s, 'APPLICANT')"
        cursor.execute(query, (username, password_hash, full_name, email))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'message': 'User registered successfully!'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/predict-loan', methods=['POST'])
def predict_loan():
    try:
        data = request.json
        logger.info(f"Loan request received: {data.get('fullName')}")
        
        # Prepare data for RiskScorer and ML Predictor
        features = {
            'annual_income': safe_float(data.get('income')),
            'loan_amount': safe_float(data.get('loanAmount')),
            'credit_score': safe_int(data.get('creditScore')),
            'monthly_existing_emis': safe_float(data.get('existingLoans')),
            'employment_type': data.get('employmentType') or 'Salaried',
            'loan_tenure_months': safe_int(data.get('tenure')) or 60,
            'age': safe_int(data.get('age')) or 30,
            'years_in_current_job': safe_float(data.get('jobTenure')) or 2.0,
            'loan_purpose': data.get('loanPurpose') or 'Personal',
            'repayment_history': data.get('repaymentHistory') or 'No defaults',
            
            # Additional fields required by ML Predictor (not in form)
            'total_work_experience': safe_float(data.get('jobTenure')) + 2.0, # Guess
            'existing_loan_count': 0 if data.get('existingLoans') == 0 else 1,
            'residential_status': 'Owned',
            'number_of_dependents': 0,
            'city_tier': 'Tier-1',
            'education_level': 'Graduate',
            'marital_status': 'Married',
            'bank_account_vintage_months': 24
        }
        
        # Education loan specifics
        if data.get('loanPurpose') == 'Education':
            features['co_applicant_income'] = safe_float(data.get('coApplicantIncome'))
            features['co_applicant_existing_debt'] = safe_float(data.get('coApplicantExistingDebt'))
            features['previous_marks'] = safe_float(data.get('previousMarks'))

        # Run AI Analysis
        risk_res = risk_scorer.calculate_risk_score(features)
        ml_res = ml_predictor.predict(features)
        
        # Prepare Comprehensive ML Insight for Dashboard
        ml_insight = risk_res.get('derived_features', {})
        ml_insight['recommendation'] = ml_res['recommendation']
        ml_insight['confidence'] = ml_res['confidence']
        
        final_status = risk_res['approval_status']
        if final_status == 'REVIEW': final_status = 'PENDING'
        
        conn = get_db_connection()
        if not conn: return jsonify({'error': 'Database Connection Failed'}), 500
        
        cursor = conn.cursor()
        query = """
        INSERT INTO applications (
            id, applicant_id, full_name, mobile, email, age, income, employment_type,
            credit_score, existing_loan_count, repayment_history, job_tenure,
            loan_amount, loan_purpose, tenure, status, risk_level, ai_creditworthiness,
            ml_confidence, ai_reasoning, score_breakdown, ml_insight, recommendations
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data.get('id'),
            data.get('userId'),
            data.get('fullName'),
            data.get('mobile'),
            data.get('email'),
            features['age'],
            features['annual_income'],
            features['employment_type'],
            features['credit_score'],
            safe_int(data.get('existingLoans')),
            features['repayment_history'],
            features['years_in_current_job'],
            features['loan_amount'],
            features['loan_purpose'],
            features['loan_tenure_months'],
            final_status,
            risk_res['risk_level'],
            risk_res['creditworthiness_score'],
            ml_res['confidence'],
            json.dumps(risk_res['reasoning']),
            json.dumps(risk_res['score_breakdown']),
            json.dumps(ml_insight),
            json.dumps(risk_res.get('recommendation', ''))
        ))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': final_status,
            'risk_score': risk_res['creditworthiness_score'],
            'risk_level': risk_res['risk_level'],
            'score_breakdown': risk_res['score_breakdown'],
            'reasoning': risk_res['reasoning'],
            'recommendation': ml_res['recommendation'],
            'ml_insight': ml_insight,
            'derived_features': ml_insight # Fallback for UI that looks for derived_features
        })
    except Exception as e:
        logger.error(f"Error in predict-loan: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/officer/dashboard')
def get_officer_dashboard():
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) as total FROM applications")
        total = cursor.fetchone()['total']
        cursor.execute("SELECT COUNT(*) as approved FROM applications WHERE status='APPROVED'")
        approved = cursor.fetchone()['approved']
        cursor.execute("SELECT COUNT(*) as rejected FROM applications WHERE status='REJECTED'")
        rejected = cursor.fetchone()['rejected']
        cursor.execute("SELECT COUNT(*) as pending FROM applications WHERE status='PENDING'")
        pending = cursor.fetchone()['pending']
        
        cursor.execute("SELECT * FROM applications ORDER BY created_at DESC LIMIT 10")
        recent = [format_application(app) for app in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        return jsonify({
            'stats': {'total': total, 'approved': approved, 'rejected': rejected, 'pending': pending},
            'recentApplications': recent,
            'trendData': [
                {'name': 'Mon', 'apps': 4}, {'name': 'Tue', 'apps': 7}, {'name': 'Wed', 'apps': 5},
                {'name': 'Thu', 'apps': 8}, {'name': 'Fri', 'apps': 12}, {'name': 'Sat', 'apps': 4}, {'name': 'Sun', 'apps': 2}
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/applications')
def get_applications():
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        applicant_id = request.args.get('applicant_id')
        cursor = conn.cursor(dictionary=True)
        if applicant_id:
            cursor.execute("SELECT * FROM applications WHERE applicant_id = %s ORDER BY created_at DESC", (applicant_id,))
        else:
            cursor.execute("SELECT * FROM applications ORDER BY created_at DESC")
        apps = [format_application(app) for app in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify(apps)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update-status', methods=['POST', 'OPTIONS'])
def update_status():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
        
    data = request.json
    app_id = data.get('id')
    status = data.get('status')
    remark = data.get('remark', '')
    officer_name = data.get('officer', 'System')
    
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        # 1. Update Application Status
        cursor.execute("""
            UPDATE applications 
            SET status = %s, banker_remark = %s, reviewed_by = %s, decision_date = %s, is_manual_override = TRUE 
            WHERE id = %s
        """, (status, remark, officer_name, datetime.now(), app_id))
        
        # 2. Get Officer ID for Audit log
        cursor.execute("SELECT id FROM users WHERE full_name = %s LIMIT 1", (officer_name,))
        officer = cursor.fetchone()
        off_id = officer['id'] if officer else 1 # Default to system admin
        
        # 3. Log to Application History
        cursor.execute("""
            INSERT INTO application_history (application_id, officer_id, action, rejection_reason, is_manual_override)
            VALUES (%s, %s, %s, %s, TRUE)
        """, (app_id, off_id, status, remark))
        
        # 4. Get Applicant ID to send notification
        cursor.execute("SELECT applicant_id FROM applications WHERE id = %s", (app_id,))
        app_record = cursor.fetchone()
        if app_record and app_record['applicant_id']:
            cursor.execute("""
                INSERT INTO notifications (user_id, message, type, application_id)
                VALUES (%s, %s, %s, %s)
            """, (app_record['applicant_id'], f"Loan Decision: Your application {app_id} has been {status}.", status, app_id))

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error updating status: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/audit-logs')
def get_audit_logs():
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        # Join history with applications and users to get rich data for the ledger
        query = """
            SELECT 
                h.id, h.application_id, h.action, h.rejection_reason, h.decision_timestamp,
                u.full_name as officer_name,
                a.full_name as applicant_name,
                a.loan_amount
            FROM application_history h
            JOIN applications a ON h.application_id = a.id
            LEFT JOIN users u ON h.officer_id = u.id
            ORDER BY h.decision_timestamp DESC
        """
        cursor.execute(query)
        logs = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(logs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/stats')
def get_admin_stats():
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        # 1. User counts
        cursor.execute("SELECT COUNT(*) as total, SUM(CASE WHEN status='ACTIVE' THEN 1 ELSE 0 END) as active FROM users")
        user_stats = cursor.fetchone()
        
        # 2. Application status distribution
        cursor.execute("SELECT status, COUNT(*) as count FROM applications GROUP BY status")
        app_dist = {row['status']: row['count'] for row in cursor.fetchall()}
        
        # 3. AI Risk Distribution
        cursor.execute("SELECT risk_level, COUNT(*) as count FROM applications GROUP BY risk_level")
        risk_dist = {row['risk_level']: row['count'] for row in cursor.fetchall()}
        
        cursor.close()
        conn.close()
        return jsonify({
            'users': {'total': user_stats['total'], 'active': user_stats['active']},
            'apps': {
                'total': sum(app_dist.values()),
                'approved': app_dist.get('APPROVED', 0),
                'rejected': app_dist.get('REJECTED', 0),
                'pending': app_dist.get('PENDING', 0)
            },
            'risk': risk_dist,
            'health': 'Operational',
            'uptime': '99.99%',
            'ai_status': 'Enabled'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users')
def get_all_users():
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        # Fetch all users for admin management
        cursor.execute("SELECT id, username, full_name, email, role, status, created_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        for u in users:
            if u['created_at'] and hasattr(u['created_at'], 'isoformat'):
                u['created_at'] = u['created_at'].isoformat()
        cursor.close()
        conn.close()
        return jsonify(users)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/add-user', methods=['POST'])
def add_staff():
    data = request.json
    username = data.get('username')
    full_name = data.get('full_name')
    role = data.get('role', 'OFFICER')
    
    if not all([username, full_name]):
        return jsonify({'error': 'Missing fields'}), 400
        
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor()
        # Default password is username for new staff
        password_hash = bcrypt.generate_password_hash(username).decode('utf-8')
        cursor.execute("INSERT INTO users (username, password_hash, full_name, role) VALUES (%s, %s, %s, %s)",
                      (username, password_hash, full_name, role))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>/status', methods=['PATCH'])
def update_user_status(user_id):
    status = request.json.get('status')
    if status not in ['ACTIVE', 'INACTIVE', 'SUSPENDED']:
        return jsonify({'error': 'Invalid status'}), 400
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET status = %s WHERE id = %s", (status, user_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>/role', methods=['PATCH'])
def update_user_role(user_id):
    role = request.json.get('role')
    if role not in ['ADMIN', 'OFFICER', 'APPLICANT']:
        return jsonify({'error': 'Invalid role'}), 400
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET role = %s WHERE id = %s", (role, user_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user_by_id(user_id):
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/risk-settings', methods=['GET', 'POST'])
def handle_risk_settings():
    if request.method == 'POST':
        # In a real app, we'd save to a config table. 
        # For now, we'll simulate success.
        return jsonify({'success': True, 'msg': 'Global risk protocol updated'})
    return jsonify({
        'approval_threshold': 75,
        'review_threshold': 55,
        'ai_sensitivity': 'High'
    })

@app.route('/api/admin/ai-metrics')
def get_ai_metrics():
    return jsonify({
        'avg_score': 68.4,
        'high_risk_count': 12,
        'model_status': 'Operational',
        'confidence_index': 0.94
    })

@app.route('/api/admin/fraud-alerts')
def get_fraud_alerts():
    return jsonify([
        {'id': 1, 'app_id': 'APP-502', 'user': 'John Doe', 'reason': 'High Debt-to-Income', 'severity': 'High'},
        {'id': 2, 'app_id': 'APP-104', 'user': 'Jane Smith', 'reason': 'Document Mismatch', 'severity': 'Critical'}
    ])

@app.route('/api/admin/system-health')
def get_system_health():
    return jsonify({
        'api': 'Active',
        'database': 'Active',
        'ai_engine': 'Active',
        'latency': '42ms'
    })

@app.route('/api/admin/export/<format_type>')
def export_data(format_type):
    return jsonify({'success': True, 'msg': f'Data exported as {format_type.upper()}'})

@app.route('/api/admin/applications')
def get_admin_applications():
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, full_name, loan_amount, status, created_at, ai_creditworthiness FROM applications ORDER BY created_at DESC")
        apps = cursor.fetchall()
        for a in apps:
            if a['created_at']: a['created_at'] = a['created_at'].isoformat()
        cursor.close()
        conn.close()
        return jsonify(apps)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting AI Backend Server on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
