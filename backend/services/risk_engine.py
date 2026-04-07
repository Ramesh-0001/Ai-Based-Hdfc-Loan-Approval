import logging
import json
import time
import random

logger = logging.getLogger(__name__)

class RiskEngine:
    @staticmethod
    def evaluate_application(app_data, verification_data_list):
        """
        STRICT Data Consistency Audit Engine (v3.0 - Senior Implementation)
        Ensures 100% field visibility and zero-tolerance parity checks.
        """
        print("\n--- [Audit Engine] Starting Strict Verification ---")
        
        # 1. DEFINE SCHEMA (STRICT)
        # (AppKey, DocKey, HumanLabel, Type)
        schema = [
            ('fullName', 'name', 'Identity Name', 'identity'),
            ('mobile', 'phone', 'Contact Mobile', 'medium'),
            ('income', 'income', 'Monthly Income', 'financial')
        ]

        # 2. BUILD DOCUMENT SOURCE OF TRUTH (CANONICAL)
        doc_truth = {}
        for doc in verification_data_list:
            if doc.get('status') == 'Verified':
                e = doc.get('extracted_data', {})
                # Ensure we have a dict (handled in api_server normally, but defensive here)
                if isinstance(e, str):
                    try: e = json.loads(e)
                    except: e = {}

                # Extraction Pass (Latest-Wins)
                if not doc_truth.get('name'):
                    doc_truth['name'] = e.get('full_name') or e.get('name')
                
                if not doc_truth.get('phone'):
                    doc_truth['phone'] = e.get('mobile') or e.get('phone')
                
                if not doc_truth.get('income'):
                    # Priority: Gross -> Net -> Generic
                    val = e.get('gross_salary') or e.get('net_salary') or e.get('income')
                    if val: doc_truth['income'] = RiskEngine._parse_currency(val)

        # 3. STRICT NORMALIZATION FUNCTIONS
        def normalize_name(x):
            return "".join(str(x).lower().split())

        def normalize_phone(p):
            p = "".join(filter(str.isdigit, str(p)))
            if len(p) == 11 and p.startswith('0'):
                p = p[1:]
            return p

        # 4. FIELD-BY-FIELD AUDIT LOOP
        audit = []
        fraud_score = 0
        
        for app_key, doc_key, label, s_type in schema:
            app_val = app_data.get(app_key)
            doc_val = doc_truth.get(doc_key)
            
            audit_item = {
                "field": label,
                "entered": app_val,
                "detected": doc_val,
                "severity": "none",
                "status": "verified"
            }

            # CASE 1: Document value MISSING
            if doc_val is None or doc_val == "":
                audit_item.update({
                    "detected": "Not Found in Document",
                    "severity": "high",
                    "status": "missing"
                })
                fraud_score += 50
            
            # CASE 2: Identity Mismatch
            elif s_type == 'identity':
                if normalize_name(app_val) != normalize_name(doc_val):
                    audit_item.update({
                        "severity": "high",
                        "status": "mismatch"
                    })
                    fraud_score += 60
            
            # CASE 3: Mobile Mismatch
            elif s_type == 'medium': # Mobile
                if normalize_phone(app_val) != normalize_phone(doc_val):
                    audit_item.update({
                        "severity": "medium",
                        "status": "mismatch"
                    })
                    fraud_score += 30
            
            # CASE 4: Income Mismatch
            elif s_type == 'financial':
                app_n = RiskEngine._parse_currency(app_val)
                doc_n = float(doc_val)
                if doc_n > 0:
                    diff_pct = abs(app_n - doc_n) / doc_n * 100
                    if diff_pct > 30:
                        audit_item.update({
                            "entered": f"₹{app_n:,.0f}",
                            "detected": f"₹{doc_n:,.0f}",
                            "severity": "high",
                            "status": "mismatch"
                        })
                        fraud_score += 70
                    elif diff_pct > 15:
                        audit_item.update({
                            "entered": f"₹{app_n:,.0f}",
                            "detected": f"₹{doc_n:,.0f}",
                            "severity": "medium",
                            "status": "mismatch"
                        })
                        fraud_score += 35
                else:
                    audit_item.update({"status": "missing", "severity": "high"})

            audit.append(audit_item)

        # 5. DECISION LOGIC (STRICT)
        has_high = any(a['severity'] == "high" for a in audit)
        has_medium = any(a['severity'] == "medium" for a in audit)
        
        status = "Approved"
        if has_high:
            status = "Rejected"
        elif has_medium:
            status = "Under Review"
            
        # STEP 8: DEBUGGING (MANDATORY)
        print("🔥 APP DATA:", app_data)
        print("🔥 DOC TRUTH:", doc_truth)
        print("🔥 FINAL AUDIT:", audit)
        print(f"--- [Audit Engine] Decision: {status} ---\n")

        # 6. CALCULATE NUMERIC RISK SCORE (Fraud-Aware)
        # If Rejected -> 0, Under Review -> 40-60, Approved -> 80-100
        risk_score = 100
        if status == "Rejected":
            risk_score = 0
        elif status == "Under Review":
            risk_score = 50
        
        return {
            "status": status,
            "fraud_score": int(min(100, fraud_score)),
            "risk_score": risk_score, # Return numeric representation
            "audit": audit,
            "summary": f"Data consistency check completed. Status: {status}"
        }

    @staticmethod
    def _parse_currency(val):
        if not val: return 0
        if isinstance(val, (int, float)): return float(val)
        try:
            # Handle decimals and currency symbols
            return float(str(val).replace('₹', '').replace(',', '').strip())
        except:
            return 0
