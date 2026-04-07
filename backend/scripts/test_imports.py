import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml'))
try:
    from risk_scorer import RiskScorer
    from predict import LoanApprovalPredictor
    print("Imports successful")
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
