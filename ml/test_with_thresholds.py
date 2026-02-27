"""
Configurable Risk Scorer - Adjust Thresholds for Testing
Allows you to test with different approval thresholds
"""

from risk_scorer import RiskScorer
from typing import Dict, Any


class ConfigurableRiskScorer(RiskScorer):
    """Risk scorer with configurable thresholds"""
    
    def __init__(self, 
                 approval_threshold=71,
                 manual_review_threshold=41,
                 lenient_mode=False):
        """
        Initialize with custom thresholds
        
        Args:
            approval_threshold: Minimum score for auto-approval (default: 71)
            manual_review_threshold: Minimum score for manual review (default: 41)
            lenient_mode: If True, uses more lenient thresholds (60/35)
        """
        super().__init__()
        
        if lenient_mode:
            self.approval_threshold = 60
            self.manual_review_threshold = 35
            print("🔧 LENIENT MODE ENABLED")
            print(f"   Approval: {self.approval_threshold}+ points")
            print(f"   Manual Review: {self.manual_review_threshold}-{self.approval_threshold-1} points")
            print(f"   Rejected: 0-{self.manual_review_threshold-1} points\n")
        else:
            self.approval_threshold = approval_threshold
            self.manual_review_threshold = manual_review_threshold
    
    def calculate_risk_score(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate risk score with custom thresholds"""
        # Use parent class to calculate base score
        result = super().calculate_risk_score(features)
        
        # Override approval status with custom thresholds
        final_score = result['risk_score']
        
        if final_score >= self.approval_threshold:
            result['approval_status'] = "APPROVED"
        elif final_score >= self.manual_review_threshold:
            result['approval_status'] = "MANUAL_REVIEW"
        else:
            result['approval_status'] = "REJECTED"
        
        return result


def demo_comparison():
    """Compare strict vs lenient scoring"""
    print("="*80)
    print("STRICT vs LENIENT THRESHOLD COMPARISON")
    print("="*80)
    
    # Test applicant (borderline case)
    applicant = {
        'age': 30,
        'annual_income': 600000,
        'credit_score': 680,
        'employment_type': 'Salaried',
        'loan_amount': 2000000,
        'monthly_existing_emis': 10000,
        'loan_purpose': 'Home',
        'loan_tenure_months': 240,
        'years_in_current_job': 2,
        'total_work_experience': 5,
        'existing_loan_count': 2,
        'residential_status': 'Rented',
        'number_of_dependents': 1,
        'city_tier': 'Metro',
        'education_level': 'Graduate',
        'marital_status': 'Married',
        'bank_account_vintage_months': 36
    }
    
    # Test with strict thresholds
    print("\n1. STRICT MODE (Default Banking Standards)")
    print("-"*80)
    strict_scorer = ConfigurableRiskScorer()
    strict_result = strict_scorer.calculate_risk_score(applicant)
    print(f"Risk Score: {strict_result['risk_score']:.2f}/100")
    print(f"Decision: {strict_result['approval_status']}")
    print(f"Thresholds: Approve≥71, Review≥41, Reject<41")
    
    # Test with lenient thresholds
    print("\n2. LENIENT MODE (More Approvals)")
    print("-"*80)
    lenient_scorer = ConfigurableRiskScorer(lenient_mode=True)
    lenient_result = lenient_scorer.calculate_risk_score(applicant)
    print(f"Risk Score: {lenient_result['risk_score']:.2f}/100")
    print(f"Decision: {lenient_result['approval_status']}")
    print(f"Thresholds: Approve≥60, Review≥35, Reject<35")
    
    # Comparison
    print("\n" + "="*80)
    print("COMPARISON")
    print("="*80)
    print(f"Same applicant, same risk score: {strict_result['risk_score']:.2f}/100")
    print(f"Strict Mode → {strict_result['approval_status']}")
    print(f"Lenient Mode → {lenient_result['approval_status']}")
    
    if strict_result['approval_status'] != lenient_result['approval_status']:
        print(f"\n✓ Lenient mode changed decision!")
    else:
        print(f"\n→ Both modes gave same decision")
    
    print("="*80 + "\n")


def test_your_applicant():
    """Test with your own applicant data"""
    print("="*80)
    print("TEST YOUR OWN APPLICANT")
    print("="*80)
    
    # Example: Previously rejected applicant
    your_applicant = {
        'age': 28,
        'annual_income': 400000,
        'credit_score': 620,
        'employment_type': 'Freelancer',
        'loan_amount': 1500000,
        'monthly_existing_emis': 12000,
        'loan_purpose': 'Personal',
        'loan_tenure_months': 60,
        'years_in_current_job': 0.5,
        'total_work_experience': 3,
        'existing_loan_count': 3,
        'residential_status': 'Rented',
        'number_of_dependents': 1,
        'city_tier': 'Tier-2',
        'education_level': 'Graduate',
        'marital_status': 'Single',
        'bank_account_vintage_months': 18
    }
    
    print("\nTesting with STRICT thresholds:")
    strict = ConfigurableRiskScorer()
    result1 = strict.calculate_risk_score(your_applicant)
    print(f"Score: {result1['risk_score']:.2f} → {result1['approval_status']}")
    
    print("\nTesting with LENIENT thresholds:")
    lenient = ConfigurableRiskScorer(lenient_mode=True)
    result2 = lenient.calculate_risk_score(your_applicant)
    print(f"Score: {result2['risk_score']:.2f} → {result2['approval_status']}")
    
    print("\n" + "="*80)
    print("💡 TIP: Even with lenient thresholds, very low scores will be rejected.")
    print("   This applicant has DTI of 132% - that's extremely risky!")
    print("   Use the explainability features to show HOW to improve.")
    print("="*80 + "\n")


if __name__ == "__main__":
    # Run demos
    demo_comparison()
    test_your_applicant()
    
    print("\n💡 HOW TO USE IN YOUR CODE:")
    print("="*80)
    print("# For lenient approval (more approvals)")
    print("scorer = ConfigurableRiskScorer(lenient_mode=True)")
    print("")
    print("# For custom thresholds")
    print("scorer = ConfigurableRiskScorer(approval_threshold=65, manual_review_threshold=40)")
    print("")
    print("# Then use normally")
    print("result = scorer.calculate_risk_score(applicant_data)")
    print("="*80 + "\n")
