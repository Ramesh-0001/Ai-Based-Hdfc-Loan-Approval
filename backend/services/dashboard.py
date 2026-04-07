from typing import Dict, Any

class DashboardService:
    @staticmethod
    def get_financial_health_metrics(income: float, credit_score: int, existing_emis: float, requested_loan: float) -> Dict[str, Any]:
        """Requirement 13: Financial Health Dashboard"""
        monthly_income = income / 12 if income > 0 else 0
        loan_burden_ratio = (existing_emis / monthly_income * 100) if monthly_income > 0 else 100
        
        # Risk level based on combined factors
        risk_level = "High"
        if credit_score >= 750 and loan_burden_ratio < 30:
            risk_level = "Very Low"
        elif credit_score >= 700 and loan_burden_ratio < 40:
            risk_level = "Low"
        elif credit_score >= 650 and loan_burden_ratio < 50:
            risk_level = "Moderate"
            
        recommended_loan_limit = income * 4
        
        return {
            "monthly_income": round(monthly_income, 2),
            "loan_burden_ratio": round(loan_burden_ratio, 2),
            "credit_score": credit_score,
            "risk_level": risk_level,
            "recommended_loan_limit": recommended_loan_limit,
            "health_score": max(0, min(100, credit_score/10 + (50 - loan_burden_ratio))),
            "metrics": [
                {"label": "Income Stability", "value": "Good" if income > 500000 else "Average"},
                {"label": "Debt Safety", "value": "Safe" if loan_burden_ratio < 35 else "Warning"},
                {"label": "Credit Standing", "value": "Prime" if credit_score > 750 else "Regular"}
            ]
        }
