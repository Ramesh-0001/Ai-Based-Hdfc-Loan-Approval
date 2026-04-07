"""
document_routes.py — Production-ready Flask Blueprint for Document Verification

Column mapping (must match actual MySQL schema):
  DB Column        | Used In
  -----------------|---------
  user_id          | upload, ai-result, status
  doc_type         | upload, ai-result, status
  doc_name         | upload
  file_url         | upload
  status           | upload, ai-result, status
  ai_passed        | ai-result, status
  ai_confidence    | ai-result, status
  ai_summary       | ai-result, status
  extracted_data   | ai-result, status
  uploaded_at      | upload, status
  updated_at       | auto (ON UPDATE CURRENT_TIMESTAMP)
  rejection_reason | status
"""

import json
import logging
import os
import traceback
import uuid
from datetime import datetime
import mysql.connector
from dotenv import load_dotenv
from services.ocr_service import OCRService
from services.risk_engine import RiskEngine
from flask import Blueprint, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

# ─── Config ──────────────────────────────────────────────────────────────────
load_dotenv()
logger = logging.getLogger(__name__)

documents_bp = Blueprint("documents", __name__, url_prefix="/api/documents")
CORS(documents_bp)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}

ALLOWED_DOC_TYPES = {
    "id_proof",
    "income_proof",
    "admission_letter",
    "student_id",
    "parent_income_proof",
    "parent_bank_statement",
    "pan_card",
    "bank_statement",
}

# ─── DB helper ────────────────────────────────────────────────────────────────
def get_db_connection():
    """Return a fresh MySQL connection."""
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', '1234'),
        database=os.getenv('DB_NAME', 'AiHdfcLoanApproval')
    )

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ═══════════════════════════════════════════════════════════════════════════════
#  POST /api/documents/upload
# ═══════════════════════════════════════════════════════════════════════════════
@documents_bp.route("/upload", methods=["POST"])
def upload_document():
    try:
        # ── 1. Read form fields ───────────────────────────────────────────
        doc_type = request.form.get("doc_type", "").strip()
        user_id  = request.form.get("user_id", "").strip()
        doc_name = request.form.get("doc_name", "").strip()

        print(f"[Upload] CALLED — user_id={user_id}, doc_type={doc_type}, files={list(request.files.keys())}")

        # ── 2. Validate ──────────────────────────────────────────────────
        if not doc_type or not user_id:
            logger.warning("[Upload] Missing doc_type or user_id")
            return jsonify({"error": "doc_type and user_id are required"}), 400

        if doc_type not in ALLOWED_DOC_TYPES:
            logger.warning(f"[Upload] Invalid doc_type: {doc_type}")
            return jsonify({"error": f"Invalid doc_type '{doc_type}'"}), 400

        if "file" not in request.files:
            logger.error("[Upload] No file in request")
            return jsonify({"error": "No file part in request"}), 400

        file = request.files["file"]
        if not file.filename or not allowed_file(file.filename):
            logger.error(f"[Upload] Bad file: {file.filename if file else 'None'}")
            return jsonify({"error": "File missing or invalid type"}), 400

        # ── 3. Save file to disk ─────────────────────────────────────────
        original_name = secure_filename(file.filename)
        ext           = original_name.rsplit(".", 1)[1].lower() if "." in original_name else "bin"
        stored_name   = f"{user_id}_{doc_type}_{uuid.uuid4().hex}.{ext}"
        file_path     = os.path.join(UPLOAD_FOLDER, stored_name)
        file.save(file_path)
        file_url      = f"/uploads/{stored_name}"

        logger.info(f"[Upload] File saved: {file_path}")

        # ── 4. AI EXTRACTION (BACKEND) ─────────────────────────────
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Fetch basic user data
        cursor.execute("SELECT id, full_name as name FROM users WHERE id = %s", (user_id,))
        user_row = cursor.fetchone()
        
        # Fetch application context (where mobile and income are stored)
        cursor.execute("""
            SELECT 
                mobile, income, college_name, course_name, 
                coApplicantName, coApplicantIncome 
            FROM applications 
            WHERE applicant_id = %s 
            ORDER BY created_at DESC 
            LIMIT 1
        """, (user_id,))
        app_row = cursor.fetchone()

        user_context = {
            "name": user_row.get("name") if user_row else "Ramesh Kannan",
            "mobile": app_row.get("mobile") if app_row else "9876543210",
            "income": app_row.get("income") if app_row else 50000,
            "college_name": app_row.get("college_name") if app_row else "HDFC University",
            "course_name": app_row.get("course_name") if app_row else "Engineering"
        }
        if app_row:
            user_context.update(app_row)

        ocr_result = OCRService.extract_document_data(doc_type, file_path, user_context)
        
        ai_passed = ocr_result['passed']
        status = 'Verified' if ai_passed else 'Rejected'
        extracted_data_json = json.dumps(ocr_result['data'])

        # ── 5. Upsert into DB ────────────────────────────────────────────
        sql = """
            INSERT INTO document_verifications
                (user_id, doc_type, doc_name, status, file_url, ai_passed, ai_confidence, ai_summary, extracted_data, uploaded_at)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                doc_name       = VALUES(doc_name),
                file_url       = VALUES(file_url),
                status         = VALUES(status),
                ai_passed      = VALUES(ai_passed),
                ai_confidence  = VALUES(ai_confidence),
                ai_summary     = VALUES(ai_summary),
                extracted_data = VALUES(extracted_data),
                uploaded_at    = VALUES(uploaded_at)
        """
        params = (
            int(user_id), 
            doc_type, 
            doc_name or original_name, 
            status,
            file_url, 
            ai_passed,
            ocr_result['confidence'],
            ocr_result['summary'],
            extracted_data_json,
            datetime.utcnow()
        )

        cursor.execute(sql, params)
        conn.commit()

        # ── 6. SYNC PROFILE WITH DOCUMENT ────────────────────────────
        # If identity is verified with high confidence, update the system name
        if ai_passed and ocr_result['confidence'] > 90 and doc_type in ['id_proof', 'pan_card']:
            extracted_name = ocr_result['data'].get('full_name')
            if extracted_name:
                try:
                    # Update users table
                    cursor.execute("UPDATE users SET full_name = %s WHERE id = %s", (extracted_name, user_id))
                    # Update active applications
                    cursor.execute("UPDATE applications SET full_name = %s WHERE applicant_id = %s", (extracted_name, user_id))
                    conn.commit()
                    logger.info(f"[Sync] Profile name updated to {extracted_name} based on {doc_type}")
                except Exception as e:
                    logger.warning(f"[Sync] Failed to update profile: {e}")
        
        # ── 7. RE-EVALUATE RISKS & FRAUD ─────────────────────────────
        # Now that a document is verified, trigger the full-system audit
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Fetch all verified docs for this user
            cursor.execute("SELECT doc_type, status, extracted_data FROM document_verifications WHERE user_id = %s", (user_id,))
            verifications = cursor.fetchall()
            for v in verifications:
                if v.get('extracted_data'): v['extracted_data'] = json.loads(v['extracted_data'])
            
            # Fetch current application
            cursor.execute("SELECT * FROM applications WHERE applicant_id = %s ORDER BY created_at DESC LIMIT 1", (user_id,))
            application = cursor.fetchone()
            
            if application:
                audit_result = RiskEngine.evaluate_application(application, verifications)
                
                # Update main table
                cursor.execute("""
                    UPDATE applications SET 
                        status = %s,
                        ai_creditworthiness = %s,
                        fraud_score = %s,
                        confidence_score = %s,
                        verification_alerts = %s,
                        risk_level = %s,
                        ai_reasoning = %s,
                        audit_facts = %s
                    WHERE id = %s
                """, (
                    audit_result['status'],
                    audit_result['risk_score'],
                    audit_result['fraud_score'],
                    audit_result['confidence_score'],
                    json.dumps(audit_result['mismatches']),
                    "High" if audit_result['status'] == "Rejected" else "Medium" if audit_result['status'] == "Under Review" else "Low",
                    json.dumps(audit_result['mismatches']),
                    json.dumps({
                        "document": audit_result['document_data'],
                        "form": audit_result['entered_data']
                    }),
                    application['id']
                ))
                conn.commit()
                logger.info(f"[Audit] Application {application['id']} updated: Status={audit_result['status']}")

            cursor.close()
            conn.close()
        except Exception as ae:
            logger.error(f"[Audit] FAILED: {ae}")

        logger.info(f"[Upload+AI] Complete")

        # Send same structure as old frontend mock so UI doesn't break
        return jsonify({
            "success": True,
            "status": status,
            "file_url": file_url,
            "ai_result": {
                "passed": ai_passed,
                "confidence": ocr_result['confidence'],
                "summary": ocr_result['summary'],
                "extracted_data": ocr_result['data'],
                "checks": ocr_result['checks']
            }
        }), 200

    except Exception as e:
        traceback.print_exc()
        logger.error(f"[Upload] ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════════
#  POST /api/documents/ai-result
# ═══════════════════════════════════════════════════════════════════════════════
@documents_bp.route("/ai-result", methods=["POST"])
def store_ai_result():
    try:
        body = request.get_json(force=True, silent=True)
        if not body:
            return jsonify({"error": "Request body must be valid JSON"}), 400

        user_id        = int(body.get("user_id", 0))
        doc_type       = str(body.get("doc_type", "")).strip()
        ai_passed      = bool(body.get("ai_passed", False))
        ai_confidence  = int(body.get("ai_confidence", 0))
        ai_summary     = str(body.get("ai_summary", ""))
        extracted_raw  = body.get("extracted_data")

        status = 'Verified' if ai_passed else 'Rejected'

        # Serialize extracted_data dict → JSON string for TEXT column
        if isinstance(extracted_raw, (dict, list)):
            extracted_data = json.dumps(extracted_raw)
        else:
            extracted_data = None

        logger.info(f"[AI Result] user_id={user_id}, doc_type={doc_type}, status={status}")

        conn   = get_db_connection()
        cursor = conn.cursor()

        # ACTUAL COLUMNS: ai_passed, ai_confidence, ai_summary, extracted_data
        sql = """
            UPDATE document_verifications
            SET status         = %s,
                ai_passed      = %s,
                ai_confidence  = %s,
                ai_summary     = %s,
                extracted_data = %s
            WHERE user_id = %s AND doc_type = %s
        """
        cursor.execute(sql, (status, ai_passed, ai_confidence, ai_summary, extracted_data, user_id, doc_type))
        conn.commit()
        affected = cursor.rowcount

        cursor.close()
        conn.close()

        logger.info(f"[AI Result] DB update OK — rows affected: {affected}")

        return jsonify({"success": True, "doc_type": doc_type, "status": status}), 200

    except Exception as e:
        traceback.print_exc()
        logger.error(f"[AI Result] ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════════
#  GET /api/documents/status?user_id=<id>
# ═══════════════════════════════════════════════════════════════════════════════
@documents_bp.route("/status", methods=["GET"])
def get_verification_status():
    try:
        user_id = request.args.get("user_id", "").strip()
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM document_verifications WHERE user_id = %s ORDER BY uploaded_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        # Build response using ACTUAL column names
        documents = []
        for row in rows:
            # Deserialize extracted_data from JSON string
            ed = row.get("extracted_data")
            if ed and isinstance(ed, (str, bytes)):
                try:
                    ed = json.loads(ed)
                except:
                    ed = {}

            documents.append({
                "doc_type":       row["doc_type"],
                "status":         row["status"],
                "doc_name":       row.get("doc_name"),
                "file_url":       row.get("file_url"),
                "extracted_data": ed,
                "ai_passed":      bool(row.get("ai_passed")),
                "ai_confidence":  row.get("ai_confidence"),
                "ai_summary":     row.get("ai_summary"),
                "rejection_reason": row.get("rejection_reason"),
                "uploaded_at":    str(row["uploaded_at"]) if row.get("uploaded_at") else None,
            })

        # Compute overall status
        statuses = [d["status"] for d in documents]
        required_types = {'id_proof', 'income_proof'}
        submitted_types = {d["doc_type"] for d in documents}

        if required_types.issubset(submitted_types) and all(s == 'Verified' for s in statuses):
            overall = 'Verified'
        elif any(s == 'Rejected' for s in statuses):
            overall = 'Rejected'
        elif any(s == 'AI Processing' for s in statuses):
            overall = 'AI Processing'
        else:
            overall = 'Not Submitted'

        return jsonify({"user_id": user_id, "documents": documents, "overall_status": overall}), 200

    except Exception as e:
        traceback.print_exc()
        print(f"🔥 [Status] ERROR: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# ═══════════════════════════════════════════════════════════════════════════════
#  POST /api/documents/officer-decision
# ═══════════════════════════════════════════════════════════════════════════════
@documents_bp.route("/officer-decision", methods=["POST", "OPTIONS"])
def document_officer_decision():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    try:
        data = request.json
        user_id = data.get('user_id')
        doc_type = data.get('doc_type')
        decision = data.get('decision')
        reason = data.get('reason', '')
        officer_name = data.get('officer_name', 'Bank Officer')

        if not user_id or doc_type not in ALLOWED_DOC_TYPES:
            return jsonify({'error': 'Invalid parameters'}), 400
        if decision not in ('Verified', 'Rejected'):
            return jsonify({'error': 'Decision must be Verified or Rejected'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE document_verifications
            SET status=%s, rejection_reason=%s, reviewed_by=%s
            WHERE user_id=%s AND doc_type=%s
        """, (decision, reason if decision == 'Rejected' else None, officer_name, user_id, doc_type))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════════
#  GET /api/documents/pending
# ═══════════════════════════════════════════════════════════════════════════════
@documents_bp.route("/pending", methods=["GET"])
def document_pending_list():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT dv.id, dv.user_id, dv.doc_type, dv.doc_name, dv.status,
                   dv.ai_passed, dv.ai_confidence, dv.ai_summary, dv.uploaded_at,
                   u.full_name, u.email
            FROM document_verifications dv
            JOIN users u ON dv.user_id = u.id
            WHERE dv.status = 'Pending Manual Review'
            ORDER BY dv.uploaded_at DESC
        """)
        records = cursor.fetchall()
        for r in records:
            if r.get('uploaded_at') and hasattr(r['uploaded_at'], 'isoformat'):
                r['uploaded_at'] = r['uploaded_at'].isoformat()
        cursor.close()
        conn.close()
        return jsonify(records)

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ═══════════════════════════════════════════════════════════════════════════════
#  DELETE /api/documents/remove
# ═══════════════════════════════════════════════════════════════════════════════
@documents_bp.route("/remove", methods=["DELETE"])
def remove_document():
    try:
        user_id = request.args.get("user_id")
        doc_type = request.args.get("doc_type")

        if not user_id or not doc_type:
            return jsonify({"error": "user_id and doc_type are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Fetch file_url to delete file
        cursor.execute("SELECT file_url FROM document_verifications WHERE user_id = %s AND doc_type = %s", (user_id, doc_type))
        row = cursor.fetchone()

        if row and row['file_url']:
            # Strip leading slash and delete file
            file_path = row['file_url'].lstrip('/')
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"[Remove] Deleted file: {file_path}")

        # 2. Delete record from DB
        cursor.execute("DELETE FROM document_verifications WHERE user_id = %s AND doc_type = %s", (user_id, doc_type))
        conn.commit()
        
        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": f"Document {doc_type} removed"}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
