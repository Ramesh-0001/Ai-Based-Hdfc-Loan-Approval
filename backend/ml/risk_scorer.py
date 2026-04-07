"""
Neuro-Risk Scoring Engine (v2.0)
Implements a 100-point multi-factor risk assessment model based on institutional banking rules.
Higher Score = Higher Risk.

Modules:
1. Credit Intelligence (20)
2. Income Stability (20)
3. Debt-to-Income (20)
4. Repayment Behavior (15)
5. Fraud Detection (15)
6. Existing EMI Burden (5)
7. Loan Purpose Risk (5)

Risk Levels:
- 0–35   → Low Risk (Green)
- 36–65  → Medium Risk (Yellow)
- 66–100 → High Risk (Red)
"""

import math
from typing import Dict, Any
class RiskScorer:
    """
    NEURO-RISK ENGINE (v2.1)
    Implements a balanced weighted scoring model for high-fidelity credit audits.
    """

    # Precise Marks Distribution (Total = 100)
    WEIGHTS = {
        'credit': 20,      # Credit Intelligence
        'income': 20,      # Income Stability
        'dti': 20,         # Debt-to-Income
        'repayment': 20,   # Repayment Behavior
        'fraud': 10,       # Fraud Detection
        'emi_burden': 5,   # Existing EMI Burden
        'purpose': 5       # Loan Purpose Risk
    }

    def calculate_risk_score(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates loan eligibility using the MARKS-BASED EVALUATION HUB.
        Returns a detailed performance transcript.
        """
        # --- Analytics Root extraction ---
        annual_income = float(features.get('annual_income', 0))
        monthly_income = annual_income / 12 if annual_income > 0 else 0
        loan_amount = float(features.get('loan_amount', 0))
        credit_score = int(features.get('credit_score', 0))
        existing_emi = float(features.get('monthly_existing_emis', 0))
        tenure = int(features.get('loan_tenure_months', 60))
        job_tenure = float(features.get('years_in_current_job', 0))
        emp_type = str(features.get('employment_type', 'salaried')).lower()
        purpose = str(features.get('loan_purpose', 'personal')).lower()
        
        # Proposed EMI node calculation
        r = (10 / 100) / 12
        n = max(1, tenure)
        proposed_emi = (loan_amount * r * math.pow(1 + r, n)) / (math.pow(1 + r, n) - 1) if loan_amount > 0 else 0
        total_emi = existing_emi + proposed_emi
        
        missed_payments = int(features.get('missed_payments', 0))
        fraud_risk_level = features.get('fraud_risk', 'Low')
        
        breakdown = []
        total_marks = 0.0

        # --- Formula Hub: Marks = ((100 - Norm) / 100) * Weight ---

        # 1. Credit Intelligence (Weight: 20)
        # Norm: 850+ = 0 (Good), 300 = 100 (Bad)
        n_credit = max(0, min(100, (850 - credit_score) / 550 * 100))
        marks_credit = ((100 - n_credit) / 100) * self.WEIGHTS['credit']
        total_marks += marks_credit
        breakdown.append({
            'module': 'Credit Intelligence',
            'normalized_score': round(n_credit, 1),
            'weight': f"{self.WEIGHTS['credit']} Marks",
            'marks': round(marks_credit, 1),
            'score': round(marks_credit, 1), # Compatibility layer
            'reason': f"Registry Node: {credit_score}"
        })

        # 2. Income Stability (Weight: 20)
        # Stability logic: Max 20 pts (Good). Normalized to 0 (Good) - 100 (Bad)
        s_pts = 0
        if job_tenure >= 5: s_pts += 10
        elif job_tenure >= 2: s_pts += 6
        elif job_tenure >= 1: s_pts += 3
        if 'salaried' in emp_type: s_pts += 10
        elif 'business' in emp_type or 'self' in emp_type: s_pts += 7
        else: s_pts += 4
        
        n_income = max(0, min(100, (20 - s_pts) / 20 * 100))
        marks_income = ((100 - n_income) / 100) * self.WEIGHTS['income']
        total_marks += marks_income
        breakdown.append({
            'module': 'Income Stability',
            'normalized_score': round(n_income, 1),
            'weight': f"{self.WEIGHTS['income']} Marks",
            'marks': round(marks_income, 1),
            'score': round(marks_income, 1),
            'reason': f"Node: {emp_type.capitalize()} ({job_tenure}yr)"
        })

        # 3. Debt-to-Income (DTI) (Weight: 20)
        # 0% = 0 Risk, 60%+ = 100 Risk.
        dti = (total_emi / monthly_income * 100) if monthly_income > 0 else 100
        n_dti = max(0, min(100, (min(60, dti) / 60) * 100))
        marks_dti = ((100 - n_dti) / 100) * self.WEIGHTS['dti']
        total_marks += marks_dti
        breakdown.append({
            'module': 'Debt-to-Income (DTI)',
            'normalized_score': round(n_dti, 1),
            'weight': f"{self.WEIGHTS['dti']} Marks",
            'marks': round(marks_dti, 1),
            'score': round(marks_dti, 1),
            'reason': f"DTI Cluster: {round(dti, 1)}%"
        })

        # 4. Repayment Behavior (Weight: 20)
        # 0 missed = 0 Risk. 3 missed = 100 Risk.
        n_repay = max(0, min(100, (min(3, missed_payments) / 3) * 100))
        marks_repay = ((100 - n_repay) / 100) * self.WEIGHTS['repayment']
        total_marks += marks_repay
        breakdown.append({
            'module': 'Repayment Behavior',
            'normalized_score': round(n_repay, 1),
            'weight': f"{self.WEIGHTS['repayment']} Marks",
            'marks': round(marks_repay, 1),
            'score': round(marks_repay, 1),
            'reason': f"Audit: {missed_payments} Delays"
        })

        # 5. Fraud Detection (Weight: 10)
        n_fraud = 0
        if fraud_risk_level == 'High': n_fraud = 100
        elif fraud_risk_level == 'Medium': n_fraud = 50
        elif len(features.get('fraud_flags', [])) > 0: n_fraud = 25
        
        marks_fraud = ((100 - n_fraud) / 100) * self.WEIGHTS['fraud']
        total_marks += marks_fraud
        breakdown.append({
            'module': 'Fraud Detection',
            'normalized_score': round(n_fraud, 1),
            'weight': f"{self.WEIGHTS['fraud']} Marks",
            'marks': round(marks_fraud, 1),
            'score': round(marks_fraud, 1),
            'reason': f"Signal: {fraud_risk_level}"
        })

        # 6. Existing EMI Burden (Weight: 5)
        emi_ratio = (existing_emi / monthly_income * 100) if monthly_income > 0 else 0
        n_emi = max(0, min(100, (min(30, emi_ratio) / 30) * 100))
        marks_emi = ((100 - n_emi) / 100) * self.WEIGHTS['emi_burden']
        total_marks += marks_emi
        breakdown.append({
            'module': 'Existing EMI Burden',
            'normalized_score': round(n_emi, 1),
            'weight': f"{self.WEIGHTS['emi_burden']} Marks",
            'marks': round(marks_emi, 1),
            'score': round(marks_emi, 1),
            'reason': f"Load ratio: {round(emi_ratio, 1)}%"
        })

        # 7. Loan Purpose Risk (Weight: 5)
        purpose_risk_map = {
            'education': 20, 'home': 20, 'vehicle': 40, 'business': 70, 'personal': 100, 'debt': 100
        }
        n_purpose = purpose_risk_map.get(purpose, 80)
        marks_purpose = ((100 - n_purpose) / 100) * self.WEIGHTS['purpose']
        total_marks += marks_purpose
        breakdown.append({
            'module': 'Loan Purpose Risk',
            'normalized_score': round(n_purpose, 1),
            'weight': f"{self.WEIGHTS['purpose']} Marks",
            'marks': round(marks_purpose, 1),
            'score': round(marks_purpose, 1),
            'reason': f"Intent: {purpose.capitalize()}"
        })

        # --- Final Institutional Decision Hub ---
        final_score = round(max(0, min(100, total_marks)), 1)
        
        if final_score >= 75:
            status = "APPROVED"
            risk_level = "Low"
        elif final_score >= 60:
            status = "MANUAL REVIEW"
            risk_level = "Medium"
        else:
            status = "REJECTED"
            risk_level = "High"

        return {
            'final_score': final_score,
            'ai_score': final_score,
            'risk_level': risk_level,
            'status': status,
            'prediction': status,
            'creditworthiness_score': final_score,
            'score_breakdown': breakdown,
            'probability': final_score,
            'derived_features': {
                'dti_ratio': round(dti, 2),
                'proposed_emi': round(proposed_emi, 2),
                'total_marks': final_score
            }
        }

