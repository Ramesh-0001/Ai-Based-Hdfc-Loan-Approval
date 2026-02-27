"""
Example Approved Loan Applications
Shows exactly what inputs will get APPROVED status
"""

from risk_scorer import RiskScorer
from predict import LoanApprovalPredictor


def print_result(title, applicant, scorer, predictor):
    """Print results for an applicant"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)
    
    # Risk scoring
    risk_result = scorer.calculate_risk_score(applicant)
    
    # ML prediction
    ml_result = predictor.predict(applicant)
    
    print(f"\n📊 Risk Score: {risk_result['risk_score']:.2f}/100")
    print(f"🚦 Risk Decision: {risk_result['approval_status']}")
    print(f"🤖 ML Prediction: {ml_result['prediction']} ({ml_result['confidence']:.1%} confidence)")
    
    print(f"\n💡 Key Metrics:")
    print(f"   DTI Ratio: {risk_result['derived_features']['dti_ratio']:.1f}%")
    print(f"   LTI Ratio: {risk_result['derived_features']['loan_to_income_ratio']:.2f}")
    print(f"   Employment Stability: {risk_result['derived_features']['employment_stability_score']:.1f}/10")
    
    print(f"\n📋 Applicant Profile:")
    print(f"   Age: {applicant['age']} years")
    print(f"   Income: ₹{applicant['annual_income']:,}/year")
    print(f"   Credit Score: {applicant['credit_score']}")
    print(f"   Employment: {applicant['employment_type']} ({applicant['years_in_current_job']} years)")
    print(f"   Loan Amount: ₹{applicant['loan_amount']:,}")
    print(f"   Existing EMIs: ₹{applicant['monthly_existing_emis']:,}/month")
    print(f"   Loan Purpose: {applicant['loan_purpose']}")


def main():
    scorer = RiskScorer()
    predictor = LoanApprovalPredictor()
    
    print("\n" + "█"*80)
    print("  GUARANTEED APPROVED LOAN APPLICATIONS")
    print("  Copy these inputs to get APPROVED status!")
    print("█"*80)
    
    # Example 1: Excellent Government Employee
    excellent_govt = {
        'age': 35,
        'annual_income': 1200000,  # ₹12 Lakhs/year
        'credit_score': 780,  # Excellent
        'employment_type': 'Government',
        'loan_amount': 2500000,  # ₹25 Lakhs
        'monthly_existing_emis': 10000,  # Low existing debt
        'loan_purpose': 'Home',
        'loan_tenure_months': 240,  # 20 years
        'years_in_current_job': 8,
        'total_work_experience': 12,
        'existing_loan_count': 1,
        'residential_status': 'Owned',
        'number_of_dependents': 2,
        'city_tier': 'Metro',
        'education_level': 'Post-Graduate',
        'marital_status': 'Married',
        'bank_account_vintage_months': 96
    }
    
    print_result("EXAMPLE 1: Excellent Government Employee (GUARANTEED APPROVAL)", 
                 excellent_govt, scorer, predictor)
    
    # Example 2: Good Salaried Professional
    good_salaried = {
        'age': 32,
        'annual_income': 900000,  # ₹9 Lakhs/year
        'credit_score': 750,  # Very Good
        'employment_type': 'Salaried',
        'loan_amount': 2000000,  # ₹20 Lakhs
        'monthly_existing_emis': 8000,
        'loan_purpose': 'Home',
        'loan_tenure_months': 240,
        'years_in_current_job': 5,
        'total_work_experience': 8,
        'existing_loan_count': 1,
        'residential_status': 'Rented',
        'number_of_dependents': 1,
        'city_tier': 'Metro',
        'education_level': 'Graduate',
        'marital_status': 'Married',
        'bank_account_vintage_months': 60
    }
    
    print_result("EXAMPLE 2: Good Salaried Professional (GUARANTEED APPROVAL)", 
                 good_salaried, scorer, predictor)
    
    # Example 3: Young Professional (Minimum for Approval)
    young_professional = {
        'age': 28,
        'annual_income': 800000,  # ₹8 Lakhs/year
        'credit_score': 760,  # Excellent
        'employment_type': 'Salaried',
        'loan_amount': 1500000,  # ₹15 Lakhs (conservative)
        'monthly_existing_emis': 5000,  # Very low debt
        'loan_purpose': 'Home',
        'loan_tenure_months': 240,
        'years_in_current_job': 3,
        'total_work_experience': 5,
        'existing_loan_count': 1,
        'residential_status': 'Rented',
        'number_of_dependents': 0,
        'city_tier': 'Metro',
        'education_level': 'Graduate',
        'marital_status': 'Single',
        'bank_account_vintage_months': 48
    }
    
    print_result("EXAMPLE 3: Young Professional (MINIMUM FOR APPROVAL)", 
                 young_professional, scorer, predictor)
    
    # Example 4: Business Owner (High Income)
    business_owner = {
        'age': 40,
        'annual_income': 1800000,  # ₹18 Lakhs/year
        'credit_score': 770,
        'employment_type': 'Self-Employed',
        'loan_amount': 3500000,  # ₹35 Lakhs
        'monthly_existing_emis': 15000,
        'loan_purpose': 'Business',
        'loan_tenure_months': 120,
        'years_in_current_job': 10,
        'total_work_experience': 15,
        'existing_loan_count': 2,
        'residential_status': 'Owned',
        'number_of_dependents': 2,
        'city_tier': 'Metro',
        'education_level': 'Post-Graduate',
        'marital_status': 'Married',
        'bank_account_vintage_months': 120
    }
    
    print_result("EXAMPLE 4: Business Owner (HIGH INCOME)", 
                 business_owner, scorer, predictor)
    
    # Summary
    print("\n" + "█"*80)
    print("  KEY FACTORS FOR APPROVAL")
    print("█"*80)
    print("""
✅ MUST HAVE:
   1. Credit Score: 750+ (Excellent tier)
   2. DTI Ratio: <40% (Total monthly EMIs < 40% of monthly income)
   3. LTI Ratio: <3.0 (Loan amount < 3× annual income)
   4. Employment Stability: 3+ years in current job
   5. Low Existing Debt: Minimal existing EMIs

💡 FORMULA FOR SUCCESS:
   - Monthly Income = Annual Income ÷ 12
   - Proposed EMI = Loan Amount ÷ Tenure (approx)
   - Total EMIs = Existing EMIs + Proposed EMI
   - DTI Ratio = (Total EMIs ÷ Monthly Income) × 100
   - DTI MUST BE < 40% for approval!

📝 QUICK CALCULATOR:
   If Income = ₹8,00,000/year (₹66,667/month)
   Max Total EMIs = ₹26,667/month (40% DTI)
   If Existing EMIs = ₹5,000/month
   Max New EMI = ₹21,667/month
   Max Loan (20 years) = ₹21,667 × 180 = ₹39 Lakhs (approx)

🎯 EASIEST WAY TO GET APPROVED:
   - High income (₹8L+)
   - Excellent credit (750+)
   - Low existing debt (₹5K-10K EMI)
   - Stable job (3+ years)
   - Reasonable loan amount (2-3× income)
    """)
    print("█"*80 + "\n")


if __name__ == "__main__":
    main()
