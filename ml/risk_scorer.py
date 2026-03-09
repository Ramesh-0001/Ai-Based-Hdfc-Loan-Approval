"""
Risk Scoring Engine for HDFC AI Loan Approval System
Implements a 100-point multi-factor scoring model following real banking rules.

Scoring Weights:
  Credit Score       → 30 points
  Loan-to-Income     → 25 points
  Income Stability   → 15 points
  Debt-to-Income     → 20 points
  Age & Stability    → 10 points
                      ─────────
  Total              → 100 points

Decision Logic:
  Score ≥ 70  → APPROVED
  Score 50–69 → MANUAL_REVIEW
  Score < 50  → REJECTED

IMPORTANT: Income values in the database are ANNUAL (e.g. 900000 = ₹9 LPA).
           All calculations convert to monthly where needed.
"""

import math
from typing import Dict, Any


class RiskScorer:
    """
    Calculates a creditworthiness score (0-100) based on realistic HDFC-style
    banking rules using a weighted multi-factor model.
    """

    # ── Standard EMI Formula ────────────────────────────────────────────────
    @staticmethod
    def _calculate_emi(principal: float, annual_rate: float = 10.0, tenure_months: int = 60) -> float:
        """
        EMI = [P × R × (1+R)^N] / [(1+R)^N – 1]
        P = principal, R = monthly rate, N = tenure in months
        Default: 10% interest, 60 months tenure
        """
        if principal <= 0 or tenure_months <= 0:
            return 0.0
        r = (annual_rate / 100) / 12
        n = tenure_months
        try:
            emi = (principal * r * math.pow(1 + r, n)) / (math.pow(1 + r, n) - 1)
            return round(emi, 2)
        except (ZeroDivisionError, OverflowError):
            return 0.0

    # ── Main Scoring Method ─────────────────────────────────────────────────
    def calculate_risk_score(self, features: Dict[str, Any]) -> Dict[str, Any]:
        # ── Extract Input Features ──────────────────────────────────────────
        annual_income   = float(features.get('annual_income', 0))
        loan_amount     = float(features.get('loan_amount', 0))
        credit_score    = int(features.get('credit_score', 0))
        existing_emi    = float(features.get('monthly_existing_emis', 0))
        emp_type        = features.get('employment_type', '')
        tenure          = int(features.get('loan_tenure_months', 60))
        age             = int(features.get('age', 30))
        years_in_job    = float(features.get('years_in_current_job', 0))

        if tenure <= 0:
            tenure = 60  # Default 5-year tenure

        monthly_income = annual_income / 12 if annual_income > 0 else 0
        reasons = []
        score_breakdown = {}

        # ════════════════════════════════════════════════════════════════════
        # 1. CREDIT SCORE  (Max 30 points)
        # ════════════════════════════════════════════════════════════════════
        if credit_score >= 750:
            credit_pts = 30
            reasons.append(f"Excellent Credit Score ({credit_score}) — 750+ is premium tier.")
        elif credit_score >= 700:
            credit_pts = 24
            reasons.append(f"Good Credit Score ({credit_score}) — within the 700-749 healthy range.")
        elif credit_score >= 650:
            credit_pts = 15
            reasons.append(f"Average Credit Score ({credit_score}) — room for improvement.")
        else:
            credit_pts = 5
            reasons.append(f"Risky Credit Score ({credit_score}) — below 650 is considered high risk.")
        score_breakdown['credit_score'] = credit_pts

        # ════════════════════════════════════════════════════════════════════
        # 2. LOAN-TO-INCOME RATIO (LTI)  (Max 25 points)
        #    Formula: loan_amount / annual_income
        #    ≤ 2 → Very Safe | 2-4 → Medium | > 4 → High Risk
        # ════════════════════════════════════════════════════════════════════
        if annual_income > 0:
            lti = loan_amount / annual_income
        else:
            lti = 999.0

        if lti <= 2:
            lti_pts = 25
            reasons.append(f"Very Safe Loan-to-Income ratio ({lti:.2f}x) — well within 2x limit.")
        elif lti <= 4:
            # Proportional scoring between 2-4
            lti_pts = max(10, round(25 - (lti - 2) * 7.5))
            reasons.append(f"Moderate Loan-to-Income ratio ({lti:.2f}x) — within acceptable 2-4x range.")
        else:
            lti_pts = 0
            reasons.append(f"High Risk Loan-to-Income ratio ({lti:.2f}x) — exceeds 4x limit.")
        score_breakdown['loan_to_income'] = lti_pts

        # ════════════════════════════════════════════════════════════════════
        # 3. INCOME STABILITY  (Max 15 points)
        #    Based on employment type + years in current job
        # ════════════════════════════════════════════════════════════════════
        income_pts = 0
        if emp_type in ('Salaried', 'Government'):
            income_pts += 10
            reasons.append(f"Stable {emp_type} employment — preferred by lenders.")
        elif emp_type in ('Self-Employed', 'Business'):
            income_pts += 6
            reasons.append(f"{emp_type} income — moderate stability.")
        else:
            income_pts += 3
            if emp_type:
                reasons.append(f"{emp_type} employment — limited stability factor.")

        # Job tenure bonus
        if years_in_job >= 3:
            income_pts += 5
        elif years_in_job >= 1:
            income_pts += 3
        else:
            income_pts += 0

        income_pts = min(15, income_pts)
        score_breakdown['income_stability'] = income_pts

        # ════════════════════════════════════════════════════════════════════
        # 4. DEBT-TO-INCOME RATIO (DTI)  (Max 20 points)
        #    Formula: total_existing_emi / monthly_income * 100
        #    < 30% → Safe | 30-40% → Moderate | > 40% → High Risk
        #    NOTE: We use EXISTING EMIs only (not proposed new EMI) for DTI
        # ════════════════════════════════════════════════════════════════════
        if monthly_income > 0:
            dti_pct = (existing_emi / monthly_income) * 100
        else:
            dti_pct = 100.0

        if dti_pct < 30:
            dti_pts = 20
            reasons.append(f"Safe existing DTI ratio ({dti_pct:.1f}%) — well below 30% threshold.")
        elif dti_pct <= 40:
            dti_pts = 12
            reasons.append(f"Moderate DTI ratio ({dti_pct:.1f}%) — in the 30-40% caution zone.")
        else:
            dti_pts = 4
            reasons.append(f"High DTI ratio ({dti_pct:.1f}%) — exceeds 40% limit, debt burden is heavy.")
        score_breakdown['debt_to_income'] = dti_pts

        # ════════════════════════════════════════════════════════════════════
        # 5. AGE & STABILITY  (Max 10 points)
        # ════════════════════════════════════════════════════════════════════
        if 25 <= age <= 55:
            age_pts = 10
        elif 21 <= age < 25 or 55 < age <= 60:
            age_pts = 6
        elif 18 <= age < 21 or 60 < age <= 65:
            age_pts = 3
        else:
            age_pts = 0
        score_breakdown['age_stability'] = age_pts

        # ════════════════════════════════════════════════════════════════════
        # FINAL SCORE CALCULATION
        # ════════════════════════════════════════════════════════════════════
        raw_score = credit_pts + lti_pts + income_pts + dti_pts + age_pts
        final_score = max(0, min(100, raw_score))

        # ── Decision Logic ──────────────────────────────────────────────────
        if final_score >= 70:
            prediction = "APPROVED"
            risk_level = "Low"
        elif final_score >= 50:
            prediction = "REVIEW"
            risk_level = "Medium"
        else:
            prediction = "REJECTED"
            risk_level = "High"

        # ── EMI & Affordability Calculations ────────────────────────────────
        proposed_emi = self._calculate_emi(loan_amount, 10.0, tenure)
        total_emi_after_loan = existing_emi + proposed_emi
        foir = (total_emi_after_loan / monthly_income * 100) if monthly_income > 0 else 100

        # ── Maximum Loan Eligibility ────────────────────────────────────────
        max_loan = annual_income * 4  # Standard banking rule

        # ── Smart Recommendation ────────────────────────────────────────────
        if loan_amount <= max_loan and final_score >= 70:
            income_lakhs = round(annual_income / 100000, 1)
            loan_lakhs = round(loan_amount / 100000, 1)
            recommendation = (
                f"Based on your ₹{income_lakhs}L annual income and strong credit profile, "
                f"your requested ₹{loan_lakhs}L loan falls within safe eligibility limits."
            )
        elif loan_amount <= max_loan:
            max_lakhs = round(max_loan / 100000, 1)
            recommendation = (
                f"Your maximum safe loan eligibility is approximately ₹{max_lakhs}L. "
                f"Your requested amount is within range, but other factors need improvement."
            )
        else:
            max_lakhs = round(max_loan / 100000, 1)
            recommendation = (
                f"Your maximum safe loan eligibility is approximately ₹{max_lakhs}L (4x annual income). "
                f"Consider reducing your loan request or increasing income sources."
            )

        return {
            'creditworthiness_score': final_score,
            'approval_status': prediction,
            'risk_level': risk_level,
            'risk_tier': f"{risk_level} Risk",
            'reasoning': reasons,
            'prediction': prediction,
            'score': final_score,
            'reason': reasons,
            'recommendation': recommendation,
            'max_loan_eligibility': max_loan,
            'score_breakdown': {
                'credit_score': f"{credit_pts}/30",
                'loan_to_income': f"{lti_pts}/25",
                'income_stability': f"{income_pts}/15",
                'debt_to_income': f"{dti_pts}/20",
                'age_stability': f"{age_pts}/10",
                'total': f"{final_score}/100"
            },
            'derived_features': {
                'monthly_income': round(monthly_income, 2),
                'loan_to_income_ratio': round(lti, 2),
                'dti_ratio': round(dti_pct, 2),
                'proposed_emi': proposed_emi,
                'total_emi_after_loan': round(total_emi_after_loan, 2),
                'foir_pct': round(foir, 2),
                'max_loan_eligibility': max_loan
            }
        }


# ── Demo / Self-Test ────────────────────────────────────────────────────────
def demo_risk_scoring():
    """Test with the user's exact scenario: ₹9L income, ₹13L loan"""
    scorer = RiskScorer()

    test_cases = [
        {
            'name': 'Safe Profile (₹9L income, ₹13L loan)',
            'data': {
                'annual_income': 900000,
                'loan_amount': 1300000,
                'credit_score': 750,
                'employment_type': 'Salaried',
                'monthly_existing_emis': 0,
                'loan_tenure_months': 60,
                'age': 32,
                'years_in_current_job': 4
            }
        },
        {
            'name': 'Moderate Profile (₹6L income, ₹20L loan)',
            'data': {
                'annual_income': 600000,
                'loan_amount': 2000000,
                'credit_score': 710,
                'employment_type': 'Self-Employed',
                'monthly_existing_emis': 8000,
                'loan_tenure_months': 60,
                'age': 35,
                'years_in_current_job': 2
            }
        },
        {
            'name': 'Risky Profile (₹3L income, ₹15L loan)',
            'data': {
                'annual_income': 300000,
                'loan_amount': 1500000,
                'credit_score': 620,
                'employment_type': 'Freelancer',
                'monthly_existing_emis': 10000,
                'loan_tenure_months': 60,
                'age': 23,
                'years_in_current_job': 0
            }
        }
    ]

    print("=" * 70)
    print("HDFC AI RISK SCORING ENGINE — TEST RESULTS")
    print("=" * 70)

    for tc in test_cases:
        result = scorer.calculate_risk_score(tc['data'])
        print(f"\n{'─' * 70}")
        print(f"  {tc['name']}")
        print(f"{'─' * 70}")
        print(f"  Score: {result['creditworthiness_score']}/100")
        print(f"  Decision: {result['approval_status']}")
        print(f"  Risk Level: {result['risk_level']}")
        print(f"\n  Score Breakdown:")
        for k, v in result['score_breakdown'].items():
            print(f"    {k.replace('_', ' ').title():.<30} {v}")
        print(f"\n  Key Metrics:")
        print(f"    LTI Ratio: {result['derived_features']['loan_to_income_ratio']}")
        print(f"    DTI Ratio: {result['derived_features']['dti_ratio']}%")
        print(f"    Proposed EMI: ₹{result['derived_features']['proposed_emi']:,.0f}")
        print(f"    Max Loan Eligibility: ₹{result['max_loan_eligibility']:,.0f}")
        print(f"\n  Recommendation: {result['recommendation']}")
        print(f"\n  Reasoning:")
        for r in result['reasoning']:
            print(f"    • {r}")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    demo_risk_scoring()
