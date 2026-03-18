from typing import Dict, List, Any

class AdvisoryService:
    @staticmethod
    def get_loan_recommendation(income: float, employment_type: str, credit_score: int) -> Dict[str, Any]:
        """Requirement 1: AI Loan Recommendation"""
        recommendations = []
        
        # Logic for Personal Loan
        if credit_score >= 650 and income >= 300000:
            recommendations.append({
                "type": "Personal Loan",
                "reasoning": "Suitable for your stable income and healthy credit score.",
                "max_amount": income * 0.5
            })
            
        # Logic for Home Loan
        if credit_score >= 700 and income >= 600000:
             recommendations.append({
                "type": "Home Loan",
                "reasoning": "Preferred for high-income profiles with excellent credit history.",
                "max_amount": income * 5
            })

        # Logic for Education Loan
        if credit_score >= 600:
             recommendations.append({
                "type": "Education Loan",
                "reasoning": "Standard option for skill development and academic pursuits.",
                "max_amount": 2000000
            })

        # Logic for Business Loan
        if employment_type in ['Business', 'Self-Employed'] and income >= 500000:
             recommendations.append({
                "type": "Business Loan",
                "reasoning": "Tailored for entrepreneurs with existing business cash flows.",
                "max_amount": income * 2
            })
            
        return {
            "eligible_types": recommendations,
            "best_pick": recommendations[0] if recommendations else None
        }

    @staticmethod
    def get_credit_improvement_tips(credit_score: int, user_profile: Dict[str, Any] = None) -> List[str]:
        """Requirement 4 & 12: Credit Score Improvement AI"""
        tips = []
        if credit_score < 750:
            tips.append("Pay all your EMIs and Credit Card bills on time.")
            tips.append("Reduce your credit card utilization below 30%.")
            
        if credit_score < 650:
            tips.append("Avoid making multiple loan applications in a short period.")
            tips.append("Check your credit report for errors and dispute them.")
            
        if user_profile:
            dti = user_profile.get('dti_ratio', 0)
            if dti > 40:
                tips.append(f"Your debt-to-income ratio is {dti:.1f}%. Close small loans to improve this.")
            
            job_tenure = user_profile.get('years_in_current_job', 0)
            if job_tenure < 1:
                tips.append("Maintain stable income by staying with your current employer for at least 1-2 years.")
                
        return tips

    @staticmethod
    def get_smart_loan_suggestion(requested_amount: float, annual_income: float, ai_score: int) -> Dict[str, Any]:
        """Requirement 10: Smart Loan Recommendation"""
        safe_limit = annual_income * 4
        
        if requested_amount > safe_limit:
            suggested_amount = safe_limit
            return {
                "suggested_amount": suggested_amount,
                "reason": f"Your requested amount exceeds the recommended income-to-loan ratio. ₹{suggested_amount:,} is safer for your profile.",
                "risk_mitigation": True
            }
        
        if ai_score < 60:
             suggested_amount = requested_amount * 0.7
             return {
                "suggested_amount": suggested_amount,
                "reason": f"Due to moderate risk score, a lower loan amount of ₹{suggested_amount:,} has a higher approval probability.",
                "risk_mitigation": True
            }
             
        return {
            "suggested_amount": requested_amount,
            "reason": "Requested amount is within safe limits for your financial profile.",
            "risk_mitigation": False
        }
