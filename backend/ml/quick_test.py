"""
Quick Explainability Test - Shows rejection analysis and improvement suggestions
"""

from risk_scorer import RiskScorer

def main():
    scorer = RiskScorer()
    
    print("\n" + "="*70)
    print("LOAN APPROVAL EXPLAINABILITY DEMO")
    print("="*70)
    
    # Rejected applicant example
    rejected = {
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
    
    print("\n1. ORIGINAL APPLICATION (REJECTED)")
    print("-"*70)
    result1 = scorer.calculate_risk_score(rejected)
    print(f"Risk Score: {result1['risk_score']:.2f}/100")
    print(f"Status: {result1['approval_status']}")
    print(f"DTI Ratio: {result1['derived_features']['dti_ratio']:.1f}%")
    print(f"LTI Ratio: {result1['derived_features']['loan_to_income_ratio']:.2f}")
    
    print("\nScore Breakdown:")
    for comp, score in result1['score_breakdown'].items():
        print(f"  {comp}: {score:.2f}")
    
    print("\nRejection Factors:")
    for reason in result1['reasoning']:
        print(f"  {reason}")
    
    # Improved applicant
    improved = rejected.copy()
    improved['credit_score'] = 760  # Improved
    improved['annual_income'] = 520000  # 30% increase
    improved['monthly_existing_emis'] = 6000  # Reduced debt
    improved['loan_amount'] = 1200000  # Reduced loan
    improved['years_in_current_job'] = 3.0  # More stability
    
    print("\n\n2. ADJUSTED APPLICATION (WITH IMPROVEMENTS)")
    print("-"*70)
    result2 = scorer.calculate_risk_score(improved)
    print(f"Risk Score: {result2['risk_score']:.2f}/100")
    print(f"Status: {result2['approval_status']}")
    print(f"DTI Ratio: {result2['derived_features']['dti_ratio']:.1f}%")
    print(f"LTI Ratio: {result2['derived_features']['loan_to_income_ratio']:.2f}")
    
    print("\nScore Breakdown:")
    for comp, score in result2['score_breakdown'].items():
        print(f"  {comp}: {score:.2f}")
    
    print("\n\n3. CHANGES MADE & IMPACT")
    print("-"*70)
    print(f"Credit Score: 620 → 760 (+140 points)")
    print(f"Annual Income: ₹400,000 → ₹520,000 (+30%)")
    print(f"Monthly EMIs: ₹12,000 → ₹6,000 (-50%)")
    print(f"Loan Amount: ₹1,500,000 → ₹1,200,000 (-20%)")
    print(f"Job Tenure: 0.5 years → 3.0 years")
    
    print(f"\nRisk Score Change: {result1['risk_score']:.2f} → {result2['risk_score']:.2f}")
    print(f"Improvement: +{result2['risk_score'] - result1['risk_score']:.2f} points")
    print(f"Status Change: {result1['approval_status']} → {result2['approval_status']}")
    
    if result2['approval_status'] == 'APPROVED':
        print("\n✅ SUCCESS! Application would now be APPROVED!")
    elif result2['approval_status'] == 'MANUAL_REVIEW':
        print("\n⚠️  IMPROVED! Moved to MANUAL_REVIEW (needs {:.2f} more points for auto-approval)".format(71 - result2['risk_score']))
    
    print("\n" + "="*70)
    print("KEY INSIGHTS:")
    print("- Credit score improvement had the biggest impact")
    print("- Reducing DTI ratio from 87.8% to 48.4% was critical")
    print("- Lower loan amount improved LTI from 3.75 to 2.31")
    print("- Employment stability added credibility")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
