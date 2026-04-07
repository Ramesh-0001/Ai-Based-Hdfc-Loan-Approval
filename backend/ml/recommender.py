"""
Loan Recommendation System
Generates intelligent suggestions to improve approval chances for rejected applications.
"""

from typing import Dict, Any, List
import copy

class LoanRecommender:
    """
    Analyzes rejected loans and suggests improvements using an iterative adjustment approach.
    """
    
    def __init__(self, risk_scorer):
        self.risk_scorer = risk_scorer
        
    def generate_recommendations(self, features: Dict[str, Any], current_result: Dict[str, Any]) -> List[str]:
        """
        Main entry point to generate recommendations if a loan is rejected.
        Recommendations must be dynamic based on user input (Requirement 4).
        """
        if current_result['approval_status'] == 'APPROVED':
            return ["Excellent profile! Your application meets our core eligibility criteria."]
            
        recommendations = []
        
        # 1. Loan Amount Reduction (Dynamic based on income and DTI)
        best_loan_amount = self._find_optimal_loan_amount(features)
        if best_loan_amount < features['loan_amount'] and best_loan_amount > 0:
            suggested_amount = (best_loan_amount // 50000) * 50000
            recommendations.append(f"Reduce loan amount: Based on your current income, a loan of ₹{suggested_amount:,} would have a significantly higher chance of approval.")
        
        # 2. Credit Score Improvement
        credit_score = features['credit_score']
        if credit_score < 700:
            target_credit = 720 if credit_score < 650 else 750
            recommendations.append(f"Improve Credit Score: Work on improving your credit score to above {target_credit}. Consistently paying off existing debts can help.")
            
        # 3. Debt-to-Income (DTI) Optimization
        dti = current_result.get('derived_features', {}).get('dti_ratio', 0)
        if dti > 40:
            recommendations.append("Reduce Monthly Obligations: Your total EMIs exceed 40% of your income. Closing an existing small loan can improve your eligibility.")
            
        # 4. Co-applicant Suggestion
        if current_result['creditworthiness_score'] < 50:
            recommendations.append("Add a Co-applicant: Adding a family member with a stable income and high credit score (750+) can significantly strengthen your application.")
            
        # 5. Income Stability (Requirement: age < 21 or low job tenure)
        if features.get('years_in_current_job', 0) < 1:
            recommendations.append("Increase Income Stability: Lenders prefer at least 1-2 years of continuous employment in the same organization.")
            
        # 6. Loan Tenure Adjustment
        if features.get('loan_tenure_months', 0) < 60 and features.get('loan_purpose') == 'Home':
            recommendations.append("Increase Loan Tenure: Opting for a longer repayment period will reduce your monthly EMI and improve DTI ratio.")

        if not recommendations:
            recommendations.append("Contact Branch: Please visit your nearest HDFC Bank branch for specialized loan products tailored to your profile.")
            
        return recommendations

    def _find_optimal_loan_amount(self, features: Dict[str, Any]) -> float:
        """Find the maximum loan amount that would shift the status to at least MANUAL_REVIEW."""
        test_features = copy.deepcopy(features)
        current_amount = features['loan_amount']
        
        # Simple iterative reduction (could be binary search for efficiency)
        # We try reducing in 10% steps
        for multiplier in [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]:
            test_features['loan_amount'] = current_amount * multiplier
            res = self.risk_scorer.calculate_risk_score(test_features)
            if res['approval_status'] in ['APPROVED', 'MANUAL_REVIEW']:
                return test_features['loan_amount']
        
        return 0

    def _find_required_credit_score(self, features: Dict[str, Any]) -> int:
        """Find the credit score needed for the current loan amount to be approved."""
        test_features = copy.deepcopy(features)
        
        # Test common credit score tiers
        for score in [650, 700, 750, 800]:
            if score <= features['credit_score']:
                continue
            test_features['credit_score'] = score
            res = self.risk_scorer.calculate_risk_score(test_features)
            if res['approval_status'] in ['APPROVED', 'MANUAL_REVIEW']:
                return score
        
        return features['credit_score']

if __name__ == "__main__":
    # Example logic test code would go here
    pass
