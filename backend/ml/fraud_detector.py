"""
Simple Fraud Detection Module for Loan Approval System
Designed for beginner-level explainability.
"""

from typing import Dict, Any, List

class FraudDetector:
    def __init__(self):
        # In a real app, we'd load history from a database
        self.history = []

    def detect(self, application: Dict[str, Any], history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Detects fraud based on advanced rules:
        1. Loan amount > 5x Income (Loan Spike)
        2. Credit score < 300 (Identity Risk)
        3. Multiple applications within short duration (Behavioral Pattern)
        4. Sudden changes in income values compared to history (Behavioral Pattern)
        """
        income = application.get('annual_income', 0)
        loan_amount = application.get('loan_amount', 0)
        credit_score = application.get('credit_score', 0)
        full_name = application.get('fullName', application.get('customer', ''))
        
        flags = []
        is_fraud = False
        risk_score = 0

        # Check for Loan Spike
        if income > 0 and loan_amount > (income * 5):
            flags.append(f"Loan Spike: Requested ₹{loan_amount:,} is > 5x income ₹{income:,}. (High risk of over-leveraging)")
            risk_score += 60

        # Check for Identity Risk (Low credit score)
        if credit_score < 300:
            flags.append("Identity Risk: Score below 300 often indicates synthetic identity or unreliable profile.")
            risk_score += 50

        # Behavioral Patterns (if history provided)
        if history:
            # Simple check for same applicant name
            previous_apps = [a for a in history if (a.get('customer') == full_name or a.get('fullName') == full_name)]
            
            # Multiple applications
            if len(previous_apps) >= 2:
                flags.append(f"Behavioral Pattern: {len(previous_apps)} previous applications detected within a short duration.")
                risk_score += 30
            
            # Sudden Income Changes
            if previous_apps:
                last_income = previous_apps[-1].get('annual_income', previous_apps[-1].get('income', 0))
                if last_income > 0 and abs(income - last_income) / last_income > 0.5:
                    flags.append(f"Behavioral Pattern: Sudden change in income values (from ₹{last_income:,} to ₹{income:,}).")
                    risk_score += 40

        if risk_score >= 50:
            is_fraud = True
            
        return {
            'status': 'Fraud' if is_fraud else 'Not Fraud',
            'fraud_risk_score': min(risk_score, 100),
            'fraud_reasons': flags if flags else ["• No suspicious patterns detected."],
            'is_fraud': is_fraud,
            'reasoning_summary': "\n".join([f"• {f}" for f in flags]) if flags else "• Applicant profile appears legitimate based on current check."
        }
