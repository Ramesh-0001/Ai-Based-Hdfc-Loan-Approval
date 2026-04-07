import sys
import os
# Add current directory to path so it can find peer modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from risk_scorer import RiskScorer
from fraud_detector import FraudDetector
from recommender import LoanRecommender

def test_pipeline():
    risk_scorer = RiskScorer()
    fraud_detector = FraudDetector()
    recommender = LoanRecommender(risk_scorer)
    
    # 1. Test Fraudulent Case
    print("\n--- TEST 1: FRAUDULENT CASE ---")
    fraud_applicant = {
        'age': 25,
        'annual_income': 500000,
        'credit_score': 700,
        'employment_type': 'Salaried',
        'loan_amount': 20000000, # 40x income!
        'monthly_existing_emis': 0,
        'loan_purpose': 'Personal',
        'loan_tenure_months': 60,
        'years_in_current_job': 1,
        'total_work_experience': 3,
        'existing_loan_count': 0,
        'residential_status': 'Rented',
        'number_of_dependents': 0,
        'city_tier': 'Metro',
        'education_level': 'Graduate',
        'bank_account_vintage_months': 12
    }
    
    fraud_res = fraud_detector.detect(fraud_applicant)
    print(f"Fraud Status: {fraud_res['fraud_risk_level']}")
    print(f"Flags: {fraud_res['fraud_flags']}")

    # 2. Test Rejected Case with Recommendations
    print("\n--- TEST 2: REJECTED CASE ---")
    weak_applicant = {
        'age': 28,
        'annual_income': 400000,
        'credit_score': 620,
        'employment_type': 'Freelancer',
        'loan_amount': 2000000,
        'monthly_existing_emis': 12000,
        'loan_purpose': 'Personal',
        'loan_tenure_months': 60,
        'years_in_current_job': 0.5,
        'total_work_experience': 2,
        'existing_loan_count': 2,
        'residential_status': 'Rented',
        'number_of_dependents': 1,
        'city_tier': 'Tier-2',
        'education_level': 'Graduate',
        'bank_account_vintage_months': 12
    }
    
    risk_res = risk_scorer.calculate_risk_score(weak_applicant)
    print(f"Risk Status: {risk_res['approval_status']}")
    
    recs = recommender.generate_recommendations(weak_applicant, risk_res)
    print("Recommendations:")
    for r in recs:
        print(f" - {r}")

if __name__ == "__main__":
    test_pipeline()
