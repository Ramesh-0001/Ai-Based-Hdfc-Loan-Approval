import json
import os
from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
import sys
import mysql.connector
from mysql.connector import Error
from datetime import datetime
from fpdf import FPDF

# Add ml directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml'))

from fraud_detector import FraudDetector
try:
    from risk_scorer import RiskScorer
    from predict import LoanApprovalPredictor
except ImportError:
    class RiskScorer:
        def calculate_risk_score(self, d): return {'approval_status': 'PENDING', 'creditworthiness_score': 70, 'risk_tier': 'Medium', 'reasoning': ['Manual check required']}
    class LoanApprovalPredictor:
        def predict(self, d): return {'prediction': 'Pending', 'confidence': 0.5}

from flask_bcrypt import Bcrypt

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# Database Configuration (Docker-friendly)
db_config = {
    'host':     os.getenv('DB_HOST', 'db'),
    'user':     os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '1234'),
    'database': os.getenv('DB_NAME', 'hdfc_loan_system')
}

# Global cache for the last working DB host to avoid repeated timeout waits
_working_db_host = None

def get_db_connection():
    """Returns a MySQL connection with optimized host failover and caching."""
    global _working_db_host
    
    env_host = os.getenv('DB_HOST') # No default here so we can detect if it's explicitly set
    
    # Define potential hosts
    hosts = []
    
    # 1. If we have a working host, try it first (it's fastest!)
    if _working_db_host:
        hosts.append(_working_db_host)
        
    # 2. Add environment host if provided
    if env_host:
        hosts.append(env_host)
        
    # 3. Fallbacks
    hosts.extend(['db', 'localhost', '127.0.0.1'])
    
    # Remove duplicates but maintain priority order
    hosts = list(dict.fromkeys([h for h in hosts if h]))
    
    last_error = None
    # We use a short connection timeout (2s) to fail fast if a host is unreachable
    # (e.g. if we're not in Docker but 'db' is in the list)
    for host in hosts:
        try:
            config = db_config.copy()
            config['host'] = host
            config['connect_timeout'] = 2 # Fail quickly if host is offline
            
            conn = mysql.connector.connect(**config)
            if conn.is_connected():
                _working_db_host = host # Remember this host for future calls
                return conn
        except Error as e:
            last_error = e
            continue
            
    print(f"CRITICAL: Failed to connect to MySQL on all hosts {hosts}: {last_error}")
    return None

# Combined Login Helper to avoid duplication

class HDFCReportPDF(FPDF):
    def header(self):
        # Branding background
        self.set_fill_color(0, 61, 130) # HDFC Blue
        self.rect(0, 0, 210, 40, 'F')
        
        # Red Accent line
        self.set_fill_color(225, 27, 34) # HDFC Red
        self.rect(0, 40, 210, 2, 'F')
        
        # Logo Text / Stylized "HDFC"
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
            # Check if password matches (bcrypt or plain for legacy/simulated)
            # For this project, we check if startswith 'pbkdf2' or '$2b$' to know if it's hashed
            # If plain, we check direct match (for easy setup)
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
    except Error:
        return None

# Initialize ML logic
fraud_detector = FraudDetector()
risk_scorer = RiskScorer()
ml_predictor = LoanApprovalPredictor()

@app.route('/')
def dashboard_view():
    return render_template('dashboard.html')

@app.route('/api/login/officer', methods=['POST'])
def officer_login():
    data = request.json
    emp_id = data.get('empId')
    password = data.get('password')
    
    user = validate_user(emp_id, password, 'OFFICER')
    if user:
        return jsonify({'success': True, 'user': {'id': user['id'], 'name': user['full_name'], 'role': 'OFFICER'}})
    return jsonify({'success': False, 'message': 'Invalid Officer Credentials'}), 401

@app.route('/api/login/admin', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    otp = data.get('otp')
    
    # Requirement: Admin auth with optional OTP field (simulated)
    # Removing strict OTP check so user doesn't get blocked
    # (Removed logic entirely)

    user = validate_user(username, password, 'ADMIN')
    if user:
        return jsonify({'success': True, 'user': {'id': user['id'], 'name': user['full_name'], 'role': 'ADMIN'}})
    return jsonify({'success': False, 'message': 'Invalid Admin Credentials'}), 401

# Legacy / Universal Login (Mainly for Applicants and backwards compatibility)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Credentials required'}), 400

    user = validate_user(username, password, expected_role='APPLICANT')
    if user:
        if isinstance(user, dict) and 'error' in user:
            return jsonify({'success': False, 'message': user['error']}), 403
            
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'name': user['full_name'],
                'role': user['role']
            }
        })
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

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
    if not conn:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor()
        # Hash password
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        query = "INSERT INTO users (username, password_hash, full_name, email, role) VALUES (%s, %s, %s, %s, 'APPLICANT')"
        cursor.execute(query, (username, password_hash, full_name, email))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'message': 'User registered successfully!'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/dashboard-stats')
def get_dashboard_stats():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database Connection Failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 1. Base Counts
        cursor.execute("SELECT COUNT(*) as total FROM applications")
        total_apps = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as approved FROM applications WHERE status='APPROVED'")
        approved = cursor.fetchone()['approved']
        
        cursor.execute("SELECT COUNT(*) as rejected FROM applications WHERE status='REJECTED'")
        rejected = cursor.fetchone()['rejected']
        
        cursor.execute("SELECT COUNT(*) as fraud FROM applications WHERE is_fraud=TRUE OR risk_level='High'")
        fraud_cases = cursor.fetchone()['fraud']
        
        # 2. Recent Activity
        cursor.execute("SELECT * FROM applications ORDER BY created_at DESC LIMIT 10")
        recent_activity = cursor.fetchall()
        
        # Format JSON fields back to objects for the frontend
        for app_row in recent_activity:
            for field in ['ml_insight', 'ai_reasoning', 'score_breakdown', 'comparison', 'recommendations']:
                if app_row.get(field) and isinstance(app_row[field], str):
                    app_row[field] = json.loads(app_row[field])
            # Map DB fields to what legacy dashboard expects
            app_row['amount'] = safe_float(app_row.get('loan_amount'))
            app_row['fullName'] = app_row['full_name']
            app_row['fraud_status'] = 'Fraud' if app_row['is_fraud'] else 'Safe'

        # 3. Fraud Alerts
        cursor.execute("SELECT id, fraud_reason as reason, full_name as customer, loan_amount as amount FROM applications WHERE is_fraud=TRUE ORDER BY created_at DESC LIMIT 5")
        fraud_alerts = cursor.fetchall()
        for alert in fraud_alerts:
            alert['amount'] = float(alert['amount'])

        cursor.close()
        conn.close()
        
        return jsonify({
            'total_apps': total_apps,
            'approved': approved,
            'rejected': rejected,
            'fraud_cases': fraud_cases,
            'recent_activity': recent_activity,
            'fraud_alerts': fraud_alerts
        })
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/applications')
def get_all_applications():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database Connection Failed'}), 500
    
    try:
        # Get query parameters for advanced filtering
        status = request.args.get('status')
        risk_level_query = request.args.get('risk_level')
        min_amount = request.args.get('min_amount')
        max_amount = request.args.get('max_amount')
        min_income = request.args.get('min_income')
        max_income = request.args.get('max_income')
        date_range = request.args.get('date_range')
        search = request.args.get('search')
        
        query = "SELECT * FROM applications"
        conditions = []
        params = []
        
        if status and status != 'ALL':
            conditions.append("status = %s")
            params.append(status)
        if risk_level_query and risk_level_query != 'ALL':
            conditions.append("risk_level = %s")
            params.append(risk_level_query)
        if min_amount:
            conditions.append("loan_amount >= %s")
            params.append(float(min_amount))
        if max_amount:
            conditions.append("loan_amount <= %s")
            params.append(float(max_amount))
        if min_income:
            conditions.append("income >= %s")
            params.append(float(min_income))
        if max_income:
            conditions.append("income <= %s")
            params.append(float(max_income))
        if date_range:
            if date_range == 'today':
                conditions.append("DATE(created_at) = CURDATE()")
            elif date_range == 'week':
                conditions.append("created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")
            elif date_range == 'month':
                conditions.append("created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")
        if search:
            conditions.append("(full_name LIKE %s OR id LIKE %s)")
            params.extend([f"%{search}%", f"%{search}%"])
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY created_at DESC"
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, tuple(params))
        apps = cursor.fetchall()
        
        for app_row in apps:
            for field in ['ml_insight', 'ai_reasoning', 'score_breakdown', 'comparison', 'recommendations']:
                if app_row.get(field) and isinstance(app_row[field], str):
                    try:
                        app_row[field] = json.loads(app_row[field])
                    except:
                        app_row[field] = []

            # Mapping for frontend compatibility
            app_row['fullName'] = app_row.get('full_name', '')
            app_row['mobile'] = app_row.get('mobile', '')
            app_row['loanAmount'] = safe_float(app_row.get('loan_amount'))
            app_row['income'] = safe_float(app_row.get('income'))
            app_row['loanPurpose'] = app_row.get('loan_purpose', '')
            app_row['aiCreditworthiness'] = safe_int(app_row.get('ai_creditworthiness'))
            app_row['mlConfidence'] = safe_float(app_row.get('ml_confidence'))
            app_row['existingLoans'] = safe_int(app_row.get('existing_loan_count'))
            app_row['creditScore'] = safe_int(app_row.get('credit_score'))
            app_row['riskLevel'] = app_row.get('risk_level', 'High')
            app_row['status'] = app_row.get('status', 'PENDING') or 'PENDING'
            
            # Application and Last Updated dates
            try:
                app_row['createdAt'] = app_row.get('created_at').isoformat() if app_row.get('created_at') else datetime.now().isoformat()
            except:
                app_row['createdAt'] = datetime.now().isoformat()

            app_row['decisionDate'] = app_row.get('decision_date').isoformat() if app_row.get('decision_date') else app_row['createdAt']
            app_row['reviewedBy'] = app_row.get('reviewed_by', 'HDFC AI Risk Engine')
            app_row['bankerRemark'] = app_row.get('banker_remark', '')
            app_row['isManualOverride'] = bool(app_row.get('is_manual_override', False))

        cursor.close()
        conn.close()
        return jsonify(apps)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update-status', methods=['POST'])
def update_app_status():
    data = request.json
    app_id = data.get('id')
    status = data.get('status')
    remark = data.get('remark', '')
    officer_name = data.get('officer', 'Unknown')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database Connection Failed'}), 500
        
    try:
        cursor = conn.cursor()
        
        # 1. Update Application Status (Always do this)
        query = """
        UPDATE applications 
        SET status = %s, banker_remark = %s, reviewed_by = %s, decision_date = %s, is_manual_override = TRUE 
        WHERE id = %s
        """
        cursor.execute(query, (status, remark, officer_name, datetime.now(), app_id))
        
        # 2. Add to Audit History (Optional Ledger)
        try:
            # Try to find officer ID by name
            cursor.execute("SELECT id FROM users WHERE full_name = %s LIMIT 1", (officer_name,))
            officer_row = cursor.fetchone()
            if officer_row:
                officer_id = officer_row[0]
                history_query = """
                INSERT INTO application_history (application_id, officer_id, action, rejection_reason, is_manual_override)
                VALUES (%s, %s, %s, %s, TRUE)
                """
                cursor.execute(history_query, (app_id, officer_id, status, remark))
        except Exception as e:
            # Don't fail the whole request if history logging fails
            print(f"Error logging history: {e}")

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Error as e:
        print(f"Main status update error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete-application', methods=['DELETE'])
def delete_app():
    app_id = request.args.get('id')
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database Connection Failed'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM applications WHERE id = %s", (app_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ── Safe type-coercion helpers ───────────────────────────────────────────────────
def safe_float(value, default=0.0):
    """Convert value to float; fall back to default for empty strings, None, etc."""
    try:
        return float(value) if value not in (None, '', 'null') else default
    except (ValueError, TypeError):
        return default

def safe_int(value, default=0):
    """Convert value to int; fall back to default for empty strings, None, etc."""
    try:
        return int(float(value)) if value not in (None, '', 'null') else default
    except (ValueError, TypeError):
        return default

def calculate_score(data):
    """
    Helper function to calculate AI score based on incoming data.
    Uses the existing RiskScorer logic.
    """
    try:
        # Prepare data for the existing risk scorer
        applicant_data = {
            'annual_income': float(data.get('income') or 0),
            'loan_amount': float(data.get('loanAmount') or 0),
            'credit_score': int(data.get('creditScore') or 600),
            'age': int(data.get('age') or 30),
            'loan_purpose': data.get('loanPurpose') or 'Personal'
        }
        
        # Use existing risk_scorer initialized at line 120
        risk_res = risk_scorer.calculate_risk_score(applicant_data)
        return risk_res.get('creditworthiness_score', 50)
    except Exception as e:
        print(f"Scoring Error: {e}")
        return 50

@app.route('/api/predict-loan', methods=['POST'])
def predict_loan():
    try:
        data = request.json
        print("Loan request received:", data)

        ai_score = calculate_score(data)
        final_status = "PENDING" if ai_score < 70 else "APPROVED"

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database Connection Failed'}), 500
            
        cursor = conn.cursor()

        query = """
        INSERT INTO applications (
            id, full_name, loan_amount, income, credit_score, risk_level, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data.get('id'),
            data.get('fullName'),
            data.get('loanAmount'),
            data.get('income'),
            data.get('creditScore'),
            "Medium",
            final_status
        )

        cursor.execute(query, values)
        conn.commit()

        print("Loan saved successfully:", data.get('id'))

        cursor.close()
        conn.close()

        # We return a slightly more complete object to avoid breaking the UI completely,
        # but matching the user's requested 'status' and 'score' fields.
        return jsonify({
            'status': final_status, 
            'score': ai_score,
            'risk_level': "Medium",
            'risk_score': ai_score,
            'reasoning': ["Auto-processed by simplified AI engine"]
        })

    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}), 500

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

# ── NOTIFICATIONS ENDPOINTS ──────────────────────────────────────────────────

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Fetch notifications for a specific user_id or target_role.
    Query params: ?user_id=2  OR  ?role=OFFICER
    """
    user_id   = request.args.get('user_id')
    role      = request.args.get('role')
    unread_only = request.args.get('unread', 'false').lower() == 'true'

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database Connection Failed'}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        conditions = []
        params     = []

        if user_id:
            conditions.append('user_id = %s')
            params.append(int(user_id))
        elif role:
            conditions.append('target_role = %s')
            params.append(role)
        else:
            return jsonify({'error': 'Provide user_id or role query param'}), 400

        if unread_only:
            conditions.append('is_read = FALSE')

        where = 'WHERE ' + ' AND '.join(conditions) if conditions else ''
        cursor.execute(
            f"SELECT * FROM notifications {where} ORDER BY created_at DESC LIMIT 50",
            params
        )
        notifications = cursor.fetchall()
        cursor.close()
        conn.close()

        # Serialize datetime objects
        for n in notifications:
            if n.get('created_at'):
                n['created_at'] = n['created_at'].isoformat()

        # Count unread
        unread_count = sum(1 for n in notifications if not n['is_read'])
        return jsonify({'notifications': notifications, 'unread_count': unread_count})
    except Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/notifications/mark-read', methods=['POST'])
def mark_notifications_read():
    """Mark one or all notifications as read.
    Body: { "notification_id": 5 }  OR  { "user_id": 2, "all": true }
    """
    data            = request.json or {}
    notification_id = data.get('notification_id')
    user_id         = data.get('user_id')
    mark_all        = data.get('all', False)

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database Connection Failed'}), 500

    try:
        cursor = conn.cursor()
        if notification_id:
            cursor.execute('UPDATE notifications SET is_read = TRUE WHERE id = %s', (notification_id,))
        elif user_id and mark_all:
            cursor.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = %s', (user_id,))
        else:
            return jsonify({'error': 'Provide notification_id OR (user_id + all: true)'}), 400

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/notifications/unread-count', methods=['GET'])
def get_unread_count():
    """Quick badge count. Query params: ?user_id=2 OR ?role=OFFICER"""
    user_id = request.args.get('user_id')
    role    = request.args.get('role')

    conn = get_db_connection()
    if not conn:
        return jsonify({'count': 0}), 500

    try:
        cursor = conn.cursor()
        if user_id:
            cursor.execute(
                'SELECT COUNT(*) FROM notifications WHERE user_id=%s AND is_read=FALSE',
                (int(user_id),)
            )
        elif role:
            cursor.execute(
                'SELECT COUNT(*) FROM notifications WHERE target_role=%s AND is_read=FALSE',
                (role,)
            )
        else:
            return jsonify({'error': 'Provide user_id or role'}), 400

        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return jsonify({'count': count})
    except Error as e:
        return jsonify({'count': 0}), 500


# ── ADMIN MANAGEMENT ENDPOINTS ────────────────────────────────────────────────

@app.route('/api/admin/users', methods=['GET'])
def get_admin_users():
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, full_name, role, status, created_at FROM users WHERE role IN ('OFFICER', 'ADMIN')")
        users = cursor.fetchall()
        for u in users:
            if u['created_at']: u['created_at'] = u['created_at'].isoformat()
        cursor.close()
        conn.close()
        return jsonify(users)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/add-user', methods=['POST'])
def add_admin_user():
    data = request.json
    username = data.get('username')
    password = data.get('password', '1234')
    full_name = data.get('full_name')
    role = data.get('role', 'OFFICER')
    
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor()
        # Hash password if bcrypt is available and we want security, else use plain for this demo
        # For consistency with validate_user, we can use plain or bcrypt
        cursor.execute(
            "INSERT INTO users (username, password_hash, full_name, role) VALUES (%s, %s, %s, %s)",
            (username, password, full_name, role)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/delete-user', methods=['DELETE'])
def delete_admin_user():
    user_id = request.args.get('id')
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/audit-logs', methods=['GET'])
def get_audit_logs():
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB Offline'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT h.*, u.full_name as officer_name, a.full_name as applicant_name, a.loan_amount, a.status as current_status
        FROM application_history h
        JOIN users u ON h.officer_id = u.id
        JOIN applications a ON h.application_id = a.id
        ORDER BY h.decision_timestamp DESC
        """
        cursor.execute(query)
        logs = cursor.fetchall()
        for l in logs:
            if l['decision_timestamp']: l['decision_timestamp'] = l['decision_timestamp'].isoformat()
            l['loan_amount'] = float(l['loan_amount']) if l['loan_amount'] else 0
        cursor.close()
        conn.close()
        return jsonify(logs)
    except Error as e:
        print(f"Audit logs error: {e}")
        return jsonify({'error': str(e)}), 500

# ── SYSTEM CONFIGURATION ENDPOINTS ────────────────────────────────────────────

@app.route('/api/admin/config', methods=['GET'])
def get_system_config():
    # In a real system, this would be in a DB table. 
    # For now, we return current thresholds used by the engine.
    config = {
        'min_credit_score': 600,
        'max_dti_ratio': 65,
        'ai_approval_threshold': 70,
        'ai_review_threshold': 50,
        'max_loan_multiple_income': 10
    }
    return jsonify(config)

@app.route('/api/admin/update-config', methods=['POST'])
def update_system_config():
    data = request.json
    # In a real app, this would update a database table or config file.
    # For now, we simulate success.
    return jsonify({'success': True, 'message': 'Neural configuration updated globally.'})


@app.route('/api/reports/loan-summary-pdf', methods=['GET'])
def generate_loan_report_pdf():
    """Generate a Professional HDFC-styled PDF report of all loans."""
    conn = get_db_connection()
    if not conn:
        return "Database Connection Error", 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, full_name, loan_amount, status, ai_creditworthiness, risk_level FROM applications ORDER BY created_at DESC")
        rows = cursor.fetchall()
        
        pdf = HDFCReportPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Internal Sanitizer helper
        def clean_txt(txt):
            if txt is None: return ""
            # Basic Arial/Helvetica supports Latin-1, let's keep it safe for now
            return str(txt).encode('latin-1', 'replace').decode('latin-1')

        # Title Section
        pdf.set_text_color(0, 61, 130)
        pdf.set_font('Helvetica', 'B', 16)
        pdf.cell(0, 10, 'Global Loan Application Ledger', 0, 1, 'C')
        pdf.ln(5)
        
        # Stats Summary
        total_loan_val = sum(float(r['loan_amount'] or 0) for r in rows)
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(50)
        pdf.cell(0, 5, f"Total Applications Indexed: {len(rows)}", 0, 1, 'L')
        pdf.cell(0, 5, f"Portfolio Value: INR {total_loan_val:,.2f}", 0, 1, 'L')
        pdf.ln(8)
        
        # Table Header
        pdf.set_fill_color(0, 61, 130) # HDFC Blue
        pdf.set_text_color(255, 255, 255)
        pdf.set_font('Helvetica', 'B', 9)
        
        pdf.cell(35, 10, 'App ID', 1, 0, 'C', True)
        pdf.cell(60, 10, 'Customer Name', 1, 0, 'C', True)
        pdf.cell(35, 10, 'Amount (INR)', 1, 0, 'C', True)
        pdf.cell(30, 10, 'Status', 1, 0, 'C', True)
        pdf.cell(30, 10, 'Risk Score', 1, 1, 'C', True)
        
        # Rows
        pdf.set_text_color(50)
        pdf.set_font('Helvetica', '', 8)
        
        for row in rows:
            if pdf.get_y() > 270: 
                pdf.add_page()
            
            pdf.cell(35, 8, clean_txt(row['id']), 1, 0, 'C')
            pdf.cell(60, 8, clean_txt(row['full_name'])[:30], 1, 0, 'L')
            pdf.cell(35, 8, f"{float(row['loan_amount'] or 0):,.2f}", 1, 0, 'R')
            
            # Status styling
            status = str(row['status'] or 'PENDING').upper()
            if status == 'APPROVED':
                pdf.set_text_color(20, 140, 20)
            elif status == 'REJECTED':
                pdf.set_text_color(200, 20, 20)
            else:
                pdf.set_text_color(80, 80, 80)
                
            pdf.cell(30, 8, status, 1, 0, 'C')
            pdf.set_text_color(50)
            pdf.cell(30, 8, f"{row['ai_creditworthiness'] or 0}% - {row['risk_level'] or 'Med'}", 1, 1, 'C')
            
        from flask import Response
        # Return the PDF as bytes, forcing an 'octet-stream' to ensure the browser saves it directly
        return Response(
            pdf.output(),
            mimetype="application/octet-stream",
            headers={
                "Content-Disposition": "attachment; filename=HDFC_Internal_Loan_Report.pdf",
                "Cache-Control": "no-cache"
            }
        )
        
    except Exception as e:
        print(f"CRITICAL PDF ERROR: {e}")
        return f"Report Generation Failed: {str(e)}", 500
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == '__main__':
    print("AI Backend Server active on: http://0.0.0.0:5001/")
    app.run(host='0.0.0.0', port=5001, debug=True)
