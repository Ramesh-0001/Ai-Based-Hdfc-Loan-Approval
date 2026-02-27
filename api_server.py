import json
import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sys
import mysql.connector
from mysql.connector import Error
from datetime import datetime

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

# Database Configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',  # Set to your MySQL password
    'database': 'hdfc_loan_system'
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Combined Login Helper to avoid duplication
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
    if not otp or otp != "123456":
        return jsonify({'success': False, 'message': 'Invalid Security OTP'}), 401

    user = validate_user(username, password, 'ADMIN')
    if user:
        return jsonify({'success': True, 'user': {'id': user['id'], 'name': user['full_name'], 'role': 'ADMIN'}})
    return jsonify({'success': False, 'message': 'Invalid Admin Credentials'}), 401

# Legacy / Universal Login (Mainly for Applicants and backwards compatibility)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    
    # Simple flow for applicants: no password required if they don't have one in DB
    # If they exist and have a password, they should use it. If not, log them as guest
    return jsonify({
        'success': True,
        'user': {
            'id': 999,
            'username': username,
            'name': username.capitalize() if username else "Guest Applicant",
            'role': 'APPLICANT'
        }
    })

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
            app_row['amount'] = float(app_row['loan_amount'])
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
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM applications ORDER BY created_at DESC")
        apps = cursor.fetchall()
        
        for app_row in apps:
            for field in ['ml_insight', 'ai_reasoning', 'score_breakdown', 'comparison', 'recommendations']:
                if app_row.get(field) and isinstance(app_row[field], str):
                    try:
                        app_row[field] = json.loads(app_row[field])
                    except:
                        app_row[field] = []

            # Mapping for frontend compatibility (Underscore to CamelCase)
            app_row['fullName'] = app_row.get('full_name', '')
            app_row['loanAmount'] = float(app_row.get('loan_amount', 0))
            app_row['income'] = float(app_row.get('income', 0))
            app_row['loanPurpose'] = app_row.get('loan_purpose', '')
            app_row['aiCreditworthiness'] = app_row.get('ai_creditworthiness', 0)
            app_row['mlConfidence'] = float(app_row.get('ml_confidence', 0))
            
            # Additional metadata for dashboard UI
            app_row['createdAt'] = app_row.get('created_at').isoformat() if app_row.get('created_at') else None
            app_row['decisionDate'] = app_row.get('decision_date').isoformat() if app_row.get('decision_date') else None
            app_row['reviewedBy'] = app_row.get('reviewed_by', 'HDFC AI Risk Engine')
            app_row['bankerRemark'] = app_row.get('banker_remark', '')
            app_row['isManualOverride'] = bool(app_row.get('is_manual_override', False))

            # Backward compatibility for existing data
            if 'ml_insight' in app_row and isinstance(app_row['ml_insight'], dict):
                app_row['mlInsight'] = app_row['ml_insight']
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
        query = """
        UPDATE applications 
        SET status = %s, banker_remark = %s, reviewed_by = %s, decision_date = %s, is_manual_override = TRUE 
        WHERE id = %s
        """
        cursor.execute(query, (status, remark, officer_name, datetime.now(), app_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Error as e:
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

@app.route('/api/predict-loan', methods=['POST'])
def predict_loan():
    try:
        from recommender import LoanRecommender
        recommender = LoanRecommender(risk_scorer)
        
        data = request.json
        applicant_data = {
            'fullName': data.get('fullName', 'Guest'),
            'age': int(data.get('age', 30)),
            'annual_income': float(data.get('income', data.get('annual_income', 0))),
            'loan_amount': float(data.get('loanAmount', data.get('loan_amount', 0))),
            'credit_score': int(data.get('creditScore', data.get('credit_score', 650))),
            'employment_type': data.get('employmentType', 'Salaried'),
            'loan_purpose': data.get('loanPurpose', 'Personal'),
            'loan_tenure_months': int(data.get('tenure', 60)),
            'monthly_existing_emis': float(data.get('existingEmis', 0)),
            'years_in_current_job': float(data.get('jobTenure', 2)),
            'total_work_experience': float(data.get('experience', 5)),
            'existing_loan_count': int(data.get('loanCount', 0)),
            'residential_status': data.get('residentialStatus', 'Rented'),
            'number_of_dependents': int(data.get('dependents', 0)),
            'city_tier': data.get('cityTier', 'Tier-1'),
            'education_level': data.get('education', 'Graduate'),
            'marital_status': data.get('maritalStatus', 'Single'),
            'bank_account_vintage_months': int(data.get('bankVintage', 24))
        }
        
        # AI Engine Execution
        fraud_res = fraud_detector.detect(applicant_data)
        risk_res = risk_scorer.calculate_risk_score(applicant_data)
        ml_res = ml_predictor.predict(applicant_data)
        
        # Decision Logic
        rule_status = risk_res['approval_status']
        ml_status = ml_res['prediction']
        final_status = rule_status
        if fraud_res['is_fraud']:
            final_status = 'REJECTED'
        elif rule_status == 'REJECTED':
            final_status = 'REJECTED'
        elif rule_status == 'APPROVED' and ml_status == 'REJECTED' and ml_res['confidence'] > 0.8:
            final_status = 'MANUAL_REVIEW'
            
        recommendations = recommender.generate_recommendations(applicant_data, risk_res)
        
        # SAVE TO MYSQL
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                # Use ID from frontend or generate one
                app_id = data.get('id', f"APP{datetime.now().strftime('%Y%m%d%H%M%S')}")
                user_id = data.get('userId') # Link to user if logged in
                
                query = """
                INSERT INTO applications (
                    id, applicant_id, full_name, age, income, loan_amount, credit_score, 
                    employment_type, loan_purpose, tenure, existing_emis, job_tenure, 
                    experience, residential_status, dependents,
                    ai_creditworthiness, risk_level, risk_category, ml_confidence, ml_insight,
                    is_fraud, fraud_risk_score, fraud_reason,
                    ai_reasoning, score_breakdown, comparison, recommendations,
                    status, reviewed_by
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                values = (
                    app_id,
                    user_id,
                    applicant_data['fullName'],
                    applicant_data['age'],
                    applicant_data['annual_income'],
                    applicant_data['loan_amount'],
                    applicant_data['credit_score'],
                    applicant_data['employment_type'],
                    applicant_data['loan_purpose'],
                    applicant_data['loan_tenure_months'],
                    applicant_data['monthly_existing_emis'],
                    applicant_data['years_in_current_job'],
                    applicant_data['total_work_experience'],
                    applicant_data['residential_status'],
                    applicant_data['number_of_dependents'],
                    risk_res['creditworthiness_score'],
                    risk_res['risk_level'],
                    risk_res['risk_tier'],
                    round(ml_res['confidence'] * 100, 2),
                    json.dumps({
                        'prediction': ml_status,
                        'confidence_score': round(ml_res['confidence'] * 100, 2),
                        'ai_recommendation': ml_res.get('recommendation', '')
                    }),
                    fraud_res['is_fraud'],
                    fraud_res.get('fraud_risk_score', 0),
                    fraud_res.get('reasoning_summary', ''),
                    json.dumps(risk_res['reasoning']),
                    json.dumps(risk_res['score_breakdown']),
                    json.dumps({
                        'rule_decision': rule_status,
                        'ml_decision': ml_status,
                        'conflict': rule_status != ml_status
                    }),
                    json.dumps(recommendations),
                    final_status,
                    'HDFC AI Risk Engine'
                )
                cursor.execute(query, values)
                conn.commit()
                cursor.close()
                conn.close()
            except mysql.connector.Error as db_err:
                print(f"Database insertion error: {db_err}")
                # Log but continue to return the prediction result

        return jsonify({
            'status': final_status,
            'risk_score': risk_res['creditworthiness_score'],
            'risk_level': risk_res['risk_level'],
            'risk_category': risk_res['risk_tier'],
            'score_breakdown': risk_res['score_breakdown'],
            'reasoning': risk_res['reasoning'],
            'fraud_detection': {
                'status': fraud_res['status'],
                'is_fraud': fraud_res['is_fraud'],
                'explanation': fraud_res.get('reasoning_summary', '')
            },
            'ml_insight': {
                'prediction': ml_status,
                'confidence_score': round(ml_res['confidence'] * 100, 2),
                'ai_recommendation': ml_res.get('recommendation', '')
            },
            'recommendations': recommendations
        })
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("AI Backend Server with MySQL active on: http://localhost:5001/")
    app.run(port=5001, debug=True)
