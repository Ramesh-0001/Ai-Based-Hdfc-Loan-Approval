import math
from typing import Dict, List, Any

class FinanceService:
    @staticmethod
    def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
        """Standard EMI Formula: [P × R × (1+R)^N] / [(1+R)^N – 1]"""
        if principal <= 0 or tenure_months <= 0 or annual_rate <= 0:
            return 0.0
        r = (annual_rate / 100) / 12
        n = tenure_months
        try:
            emi = (principal * r * math.pow(1 + r, n)) / (math.pow(1 + r, n) - 1)
            return round(emi, 2)
        except (ZeroDivisionError, OverflowError):
            return 0.0

    @classmethod
    def get_repayment_plan(cls, principal: float, annual_rate: float, tenure_months: int) -> Dict[str, Any]:
        """Requirement 2: Loan Repayment Planner"""
        emi = cls.calculate_emi(principal, annual_rate, tenure_months)
        total_repayment = emi * tenure_months
        total_interest = total_repayment - principal
        
        return {
            "monthly_emi": emi,
            "total_interest_payable": round(total_interest, 2),
            "total_repayment_amount": round(total_repayment, 2)
        }

    @classmethod
    def compare_emis(cls, principal: float, annual_rate: float, tenure_options: List[int]) -> List[Dict[str, Any]]:
        """Requirement 6: EMI Comparison Tool"""
        results = []
        for tenure in tenure_options:
            emi = cls.calculate_emi(principal, annual_rate, tenure * 12)
            results.append({
                "tenure_years": tenure,
                "tenure_months": tenure * 12,
                "emi": emi,
                "total_interest": round((emi * tenure * 12) - principal, 2)
            })
        return results

    @staticmethod
    def calculate_early_closure(outstanding_balance: float, remaining_tenure_months: int, annual_rate: float, current_emi: float) -> Dict[str, Any]:
        """Requirement 11: Early Loan Closure Calculator"""
        # Interest saved is the difference between total future payments and current principal
        total_future_payments = current_emi * remaining_tenure_months
        interest_saved = total_future_payments - outstanding_balance
        
        return {
            "current_outstanding": round(outstanding_balance, 2),
            "remaining_tenure": remaining_tenure_months,
            "interest_saved": max(0, round(interest_saved, 2)),
            "settlement_amount": round(outstanding_balance, 2), # Simplified: typically principal + small fee
            "benefit_score": "High" if interest_saved > (outstanding_balance * 0.1) else "Moderate"
        }
