
import math

class BankGradeScorer:
    """
    Implements standard banking loan eligibility rules following HDFC-style criteria.
    """
    
    def calculate_emi(self, principal, annual_rate, tenure_months):
        """
        EMI = [P × R × (1+R)^N] / [(1+R)^N – 1]
        """
        if principal <= 0 or tenure_months <= 0:
            return 0
            
        r = (annual_rate / 100) / 12
        n = tenure_months
        
        try:
            emi = (principal * r * math.pow(1 + r, n)) / (math.pow(1 + r, n) - 1)
            return round(emi, 2)
        except ZeroDivisionError:
            return 0

    def evaluate(self, data):
        """
        Evaluate loan application based on banking rules.
        """
        annual_income = float(data.get('annual_income', 0))
        credit_score = int(data.get('credit_score', 0))
        existing_emi = float(data.get('monthly_existing_emis', 0))
        loan_amount = float(data.get('loan_amount', 0))
        tenure = int(data.get('loan_tenure_months', 0))
        
        # 1. Monthly Income
        monthly_income = annual_income / 12
        
        # 2. Requested EMI (10% annual rate for realistic banking)
        new_emi = self.calculate_emi(loan_amount, 10.0, tenure)
        
        # 3. Financial Ratios
        foir = (existing_emi + new_emi) / monthly_income if monthly_income > 0 else 1.0
        income_multiplier = loan_amount / monthly_income if monthly_income > 0 else 999
        
        # 4. Strict Decision Logic based on FOIR (Primary Factor)
        if foir > 0.65:
            status = "REJECTED"
            risk_level = "High"
            reason = f"Critical Debt Burden: FOIR ({foir:.1%}) exceeds 65% limit. Debt baseline is too high for sustainable lending."
        elif foir >= 0.40:
            status = "MANUAL_REVIEW"
            risk_level = "Medium"
            reason = f"Elevated Debt Burden: FOIR ({foir:.1%}) is in the assessment zone (40-65%). Requires manual profile review."
        else:
            status = "APPROVED"
            risk_level = "Low"
            reason = f"Healthy Repayment Capacity: FOIR ({foir:.1%}) is well within the safe 40% threshold."

        # --- Secondary Fact Rejections (Override Approval but keep High Risk status) ---
        if status != "REJECTED":
            if credit_score < 600:
                status = "REJECTED"
                risk_level = "High"
                reason = f"Poor Credit Performance: Score ({credit_score}) is below the HDFC safety floor of 600."
            elif monthly_income < 25000:
                status = "REJECTED"
                risk_level = "High"
                reason = f"Minimum Income Criteria: Monthly income (₹{monthly_income:,.0f}) is below the ₹25,000 threshold."
            elif income_multiplier > 20:
                status = "REJECTED"
                risk_level = "High"
                reason = f"Excessive Leverage: Requested loan is {income_multiplier:.1f}x monthly income (Max cap 20x)."
            
        # --- Secondary Manual Review Triggers ---
        if status == "APPROVED":
            if 600 <= credit_score < 700:
                status = "MANUAL_REVIEW"
                risk_level = "Medium"
                reason = f"Borderline Credit Score ({credit_score}): Requires manual verification of repayment history."
            elif income_multiplier > 15:
                status = "MANUAL_REVIEW"
                risk_level = "Medium"
                reason = f"Pre-shipment Review: Loan exposure ({income_multiplier:.1f}x income) exceeds the 15x auto-approval limit."

        # Final quality check for Low Risk reasoning consistency
        if status == "APPROVED" and credit_score >= 750:
            reason = "Elite financial profile with strong credit history and high repayment safety margin."

        # 5. Recommendation Logic
        recommended_loan = None
        if status == "REJECTED" or status == "MANUAL_REVIEW":
            # Target 45% FOIR for safe landing
            target_new_emi = (monthly_income * 0.45) - existing_emi
            if target_new_emi > 0:
                r = (10.0 / 100) / 12
                n = tenure
                recommended_loan = target_new_emi * (math.pow(1 + r, n) - 1) / (r * math.pow(1 + r, n))
                recommended_loan = math.floor(recommended_loan / 5000) * 5000 
            
        return {
            "status": status,
            "riskLevel": risk_level,
            "foir": round(foir, 4),
            "incomeMultiplier": round(income_multiplier, 2),
            "emi": new_emi,
            "reason": reason,
            "recommendedLoanAmount": recommended_loan
        }
