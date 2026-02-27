"""
Risk Scoring Engine for Loan Approval System
Implements multi-factor risk scoring algorithm (0-100 scale)
"""

from typing import Dict, Any, Tuple
from feature_schema import FeatureEngineer, LoanPurpose


class RiskScorer:
    """
    Calculate risk score (0-100) based on multiple factors
    
    Scoring Breakdown:
    - Credit Score: 35 points
    - Income Stability: 25 points
    - Debt-to-Income Ratio: 20 points
    - Loan-to-Income Ratio: 15 points
    - Stability Factors: 5 points
    """
    
    def __init__(self):
        self.engineer = FeatureEngineer()
    
    def score_credit(self, credit_score: int) -> float:
        """
        Score based on credit score (0-35 points)
        
        Tiers:
        - 750+: 35 points (Excellent)
        - 700-749: 28 points (Good)
        - 650-699: 20 points (Fair)
        - 600-649: 12 points (Poor)
        - <600: 5 points (Very Poor)
        """
        if credit_score >= 750:
            return 35.0
        elif credit_score >= 700:
            return 28.0
        elif credit_score >= 650:
            return 20.0
        elif credit_score >= 600:
            return 12.0
        else:
            return 5.0
    
    def score_income_stability(self, employment_type: str, 
                               years_in_job: float,
                               total_experience: float,
                               annual_income: float) -> float:
        """
        Score based on income stability (0-25 points)
        
        Factors:
        - Employment type base score
        - Job tenure multiplier
        - Income level bonus
        """
        # Base score by employment type
        type_scores = {
            "Government": 15,
            "Salaried": 12,
            "Self-Employed": 10,
            "Freelancer": 7
        }
        base_score = type_scores.get(employment_type, 8)
        
        # Job tenure multiplier
        if years_in_job >= 5:
            tenure_multiplier = 1.3
        elif years_in_job >= 3:
            tenure_multiplier = 1.2
        elif years_in_job >= 2:
            tenure_multiplier = 1.0
        elif years_in_job >= 1:
            tenure_multiplier = 0.8
        else:
            tenure_multiplier = 0.6
        
        # Experience bonus (max 3 points)
        experience_bonus = min(total_experience / 5, 3.0)
        
        # Income level bonus (max 2 points)
        if annual_income >= 2000000:  # 20 lakhs+
            income_bonus = 2.0
        elif annual_income >= 1000000:  # 10 lakhs+
            income_bonus = 1.5
        elif annual_income >= 600000:  # 6 lakhs+
            income_bonus = 1.0
        else:
            income_bonus = 0.5
        
        score = (base_score * tenure_multiplier) + experience_bonus + income_bonus
        return min(score, 25.0)
    
    def score_dti_ratio(self, dti_ratio: float) -> float:
        """
        Score based on Debt-to-Income ratio (0-20 points)
        
        Lower DTI = Better score
        - DTI ≤ 20%: 20 points (Excellent)
        - DTI 21-30%: 18 points (Very Good)
        - DTI 31-40%: 15 points (Good)
        - DTI 41-50%: 10 points (Fair)
        - DTI 51-60%: 5 points (Poor)
        - DTI > 60%: 2 points (Very Poor)
        """
        if dti_ratio <= 20:
            return 20.0
        elif dti_ratio <= 30:
            return 18.0
        elif dti_ratio <= 40:
            return 15.0
        elif dti_ratio <= 50:
            return 10.0
        elif dti_ratio <= 60:
            return 5.0
        else:
            return 2.0
    
    def score_loan_to_income(self, lti_ratio: float, 
                            loan_purpose: str) -> float:
        """
        Score based on Loan-to-Income ratio (0-15 points)
        
        Adjusted by loan purpose (home loans allow higher LTI)
        """
        # Base score by LTI
        if lti_ratio <= 1:
            base_score = 15.0
        elif lti_ratio <= 2:
            base_score = 13.0
        elif lti_ratio <= 3:
            base_score = 11.0
        elif lti_ratio <= 4:
            base_score = 8.0
        elif lti_ratio <= 5:
            base_score = 5.0
        elif lti_ratio <= 6:
            base_score = 3.0
        else:
            base_score = 1.0
        
        # Purpose adjustment
        if loan_purpose == "Home" and lti_ratio <= 5:
            # Home loans allow higher LTI
            base_score = min(base_score + 2, 15.0)
        elif loan_purpose == "Education" and lti_ratio <= 3:
            # Education loans get slight bonus
            base_score = min(base_score + 1, 15.0)
        elif loan_purpose == "Personal" and lti_ratio > 3:
            # Personal loans penalized for high LTI
            base_score = max(base_score - 2, 1.0)
        
        return base_score
    
    def score_stability_factors(self, residential_status: str,
                                city_tier: str,
                                education_level: str,
                                dependents: int,
                                existing_loan_count: int,
                                bank_vintage_months: int) -> float:
        """
        Score based on stability factors (0-5 points)
        
        Factors:
        - Residential status
        - City tier
        - Education level
        - Number of dependents
        - Existing loan count
        - Bank account vintage
        """
        score = 0.0
        
        # Residential status (0-1 point)
        residential_scores = {
            "Owned": 1.0,
            "Family-Owned": 0.8,
            "Company-Provided": 0.6,
            "Rented": 0.4
        }
        score += residential_scores.get(residential_status, 0.5)
        
        # City tier (0-1 point)
        city_scores = {
            "Metro": 1.0,
            "Tier-1": 0.8,
            "Tier-2": 0.6,
            "Tier-3": 0.4
        }
        score += city_scores.get(city_tier, 0.5)
        
        # Education level (0-1 point)
        education_scores = {
            "Professional": 1.0,
            "Post-Graduate": 0.9,
            "Graduate": 0.7,
            "High-School": 0.4
        }
        score += education_scores.get(education_level, 0.5)
        
        # Dependents (0-1 point) - fewer is better
        if dependents == 0:
            score += 1.0
        elif dependents <= 2:
            score += 0.7
        elif dependents <= 4:
            score += 0.4
        else:
            score += 0.2
        
        # Existing loan count (0-0.5 point) - fewer is better
        if existing_loan_count == 0:
            score += 0.5
        elif existing_loan_count <= 2:
            score += 0.3
        else:
            score += 0.1
        
        # Bank vintage (0-0.5 point)
        if bank_vintage_months >= 60:  # 5+ years
            score += 0.5
        elif bank_vintage_months >= 36:  # 3+ years
            score += 0.4
        elif bank_vintage_months >= 24:  # 2+ years
            score += 0.3
        elif bank_vintage_months >= 12:  # 1+ year
            score += 0.2
        else:
            score += 0.1
        
        return min(score, 5.0)
    
    def apply_loan_purpose_adjustment(self, base_score: float, 
                                     loan_purpose: str,
                                     features: Dict[str, Any]) -> float:
        """
        Apply loan purpose-specific adjustments
        
        - Home Loan: +3 bonus (lower risk, collateral)
        - Education Loan: +2 bonus (investment in future)
        - Vehicle Loan: +1 bonus (depreciating asset)
        - Medical Loan: 0 (neutral)
        - Personal Loan: -2 penalty (higher risk)
        - Business Loan: Special rules
        """
        adjustment = 0.0
        
        if loan_purpose == "Home":
            adjustment = 3.0
        elif loan_purpose == "Education":
            adjustment = 2.0
        elif loan_purpose == "Vehicle":
            adjustment = 1.0
        elif loan_purpose == "Medical":
            adjustment = 0.0
        elif loan_purpose == "Personal":
            adjustment = -2.0
        elif loan_purpose == "Business":
            # Business loans require minimum experience
            if features.get('employment_type') == 'Self-Employed':
                if features.get('years_in_current_job', 0) >= 3:
                    adjustment = 1.0
                else:
                    adjustment = -5.0  # Penalty for new business
            else:
                adjustment = -3.0  # Not self-employed seeking business loan
        
        return base_score + adjustment
    
    def calculate_risk_score(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate comprehensive Creditworthiness Score (0-100)
        Note: 100 is best (Low Risk), 0 is worst (High Risk)
        
        Tiers:
        - 71-100: Low Risk (Strong Applicant)
        - 41-70: Medium Risk (Standard Profile)
        - 0-40: High Risk (Weak Profile)
        """
        # Edge Case: Zero or Negative Income
        if features.get('annual_income', 0) <= 0:
            return {
                'creditworthiness_score': 0,
                'approval_status': 'REJECTED',
                'risk_tier': 'High Risk',
                'score_breakdown': {},
                'reasoning': ["[CRITICAL] Invalid Income: Income must be greater than zero."]
            }

        # Calculate derived features
        derived = self.engineer.get_all_derived_features(features)
        
        # Calculate component scores (higher is better)
        credit_score_points = self.score_credit(features['credit_score'])
        income_stability_points = self.score_income_stability(
            features['employment_type'],
            features['years_in_current_job'],
            features['total_work_experience'],
            features['annual_income']
        )
        dti_points = self.score_dti_ratio(derived['dti_ratio'])
        lti_points = self.score_loan_to_income(
            derived['loan_to_income_ratio'],
            features['loan_purpose']
        )
        stability_points = self.score_stability_factors(
            features['residential_status'],
            features['city_tier'],
            features['education_level'],
            features['number_of_dependents'],
            features['existing_loan_count'],
            features['bank_account_vintage_months']
        )
        
        # Total Creditworthiness Score (0-100, higher is better)
        base_score = (
            credit_score_points +
            income_stability_points +
            dti_points +
            lti_points +
            stability_points
        )
        
        # Age-based risk (Requirement 2: Edge conditions e.g., age < 21)
        age_penalty = 0
        if features.get('age', 0) < 21:
            age_penalty = 15
            base_score -= age_penalty
        
        # Apply loan purpose adjustment
        final_score = self.apply_loan_purpose_adjustment(
            base_score,
            features['loan_purpose'],
            features
        )
        
        # Ensure score is within 0-100
        final_score = max(0, min(100, final_score))
        
        # Determine approval status and risk level
        if final_score >= 71:
            approval_status = "APPROVED"
            risk_level = "Low"
            risk_category = "Low Risk / Strong Profile"
        elif final_score >= 41:
            approval_status = "MANUAL_REVIEW"
            risk_level = "Medium"
            risk_category = "Medium Risk / Standard Profile"
        else:
            approval_status = "REJECTED"
            risk_level = "High"
            risk_category = "High Risk Profile"
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            final_score,
            credit_score_points,
            income_stability_points,
            dti_points,
            lti_points,
            stability_points,
            features,
            derived
        )
        
        if age_penalty > 0:
            reasoning.insert(0, f"[RISK] Age Condition: Applicant is under 21, posing higher entry-level risk.")

        return {
            'creditworthiness_score': round(final_score, 2),
            'risk_level': risk_level,
            'approval_status': approval_status,
            'risk_tier': risk_category,
            'score_breakdown': {
                'Credit Score Impact': round(credit_score_points, 2),
                'Income Stability Impact': round(income_stability_points, 2),
                'Repayment Capacity (DTI) Impact': round(dti_points, 2),
                'Loan-to-Income Impact': round(lti_points, 2),
                'Stability Factors Impact': round(stability_points, 2),
                'Age Penalty': -age_penalty if age_penalty > 0 else 0
            },
            'derived_features': derived,
            'reasoning': reasoning
        }
    
    def _generate_reasoning(self, credit_score_final: float,
                           credit_pts: float,
                           income_pts: float,
                           dti_pts: float,
                           lti_pts: float,
                           stability_pts: float,
                           features: Dict[str, Any],
                           derived: Dict[str, Any]) -> list:
        """Generate professional banking-grade reasoning for the score"""
        reasoning = []
        
        # Credit Score Evaluation
        if credit_pts >= 28:
            reasoning.append(f"• Excellent Credit Profile: Your score of {features['credit_score']} shows high reliability and disciplined repayment history.")
        elif credit_pts >= 20:
            reasoning.append(f"• Fair Credit Profile: Your score of {features['credit_score']} is acceptable, but improving it beyond 750 would unlock better rates.")
        else:
            reasoning.append(f"• Low Credit Score: Your score of {features['credit_score']} indicates high historical credit risk, which is a primary concern for approval.")
            
        # Income Level
        income = features.get('annual_income', 0)
        if income >= 1500000:
            reasoning.append(f"• High Income Level: Annual income of ₹{income:,} provides a strong buffer for loan servicing.")
        elif income >= 600000:
            reasoning.append(f"• Stable Income Level: Annual income of ₹{income:,} is adequate for standard loan products.")
        else:
            reasoning.append(f"• Limited Monthly Cashflow: Current annual income of ₹{income:,} may restrict high-value loan eligibility.")

        # LTI Ratio
        lti = derived.get('loan_to_income_ratio', 0)
        if lti <= 2.0:
            reasoning.append(f"• Healthy Loan-to-Income: Requested loan is less than 2x your annual earnings, indicating low leverage.")
        elif lti <= 4.0:
            reasoning.append(f"• Moderate Leverage: Your loan-to-income ratio ({lti}) is within manageable banking limits.")
        else:
            reasoning.append(f"• High Leverage Warning: Loan amount is {lti}x your income, which exceeds standard safety thresholds.")

        # DTI Ratio
        dti = derived.get('dti_ratio', 0)
        if dti <= 30:
            reasoning.append(f"• Strong Repayment Capacity: Monthly debt obligations consume only {dti}% of your income.")
        elif dti <= 50:
            reasoning.append(f"• Strained Cashflow: Your Debt-to-Income ratio ({dti}%) suggests limited room for additional financial stress.")
        else:
            reasoning.append(f"• Critical Debt Burden: Total EMIs consume {dti}% of your monthly income, posing a significant default risk.")

        return reasoning


def demo_risk_scoring():
    """Demonstrate risk scoring with sample applicants"""
    scorer = RiskScorer()
    
    # Sample 1: Strong applicant
    strong_applicant = {
        'age': 35,
        'annual_income': 1200000,
        'credit_score': 780,
        'employment_type': 'Government',
        'loan_amount': 2000000,
        'monthly_existing_emis': 15000,
        'loan_purpose': 'Home',
        'loan_tenure_months': 240,
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
    
    # Sample 2: Weak applicant
    weak_applicant = {
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
    
    print("=" * 70)
    print("RISK SCORING DEMONSTRATION")
    print("=" * 70)
    
    for i, applicant in enumerate([strong_applicant, weak_applicant], 1):
        print(f"\n{'APPLICANT ' + str(i):=^70}")
        result = scorer.calculate_risk_score(applicant)
        
        print(f"\nRisk Score: {result['risk_score']}/100")
        print(f"Decision: {result['approval_status']}")
        
        print("\nScore Breakdown:")
        for component, score in result['score_breakdown'].items():
            print(f"  {component.replace('_', ' ').title()}: {score}")
        
        print("\nKey Metrics:")
        for metric, value in result['derived_features'].items():
            if metric not in ['monthly_income', 'proposed_emi']:
                print(f"  {metric.replace('_', ' ').title()}: {value}")
        
        print("\nReasoning:")
        for reason in result['reasoning']:
            print(f"  {reason}")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    demo_risk_scoring()
