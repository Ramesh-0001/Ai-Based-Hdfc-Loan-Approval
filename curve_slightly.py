import re
import os

files_to_curve = [
    r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\InstitutionalDashboard.jsx",
    r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\CustomerDashboard.jsx",
    r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\AdminDashboard.jsx",
    r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\layout\Sidebar.jsx"
]

def curve_slightly(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace rounded-none with rounded-xl for a "slight" premium curve.
    # We use rounded-xl (12px) as it's the standard for modern fintech (Stripe/Apple style).
    content = content.replace('rounded-none', 'rounded-xl')
    
    # Ensure no rounded-none !important remains either.
    content = content.replace('rounded-none !important', 'rounded-xl')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Slightly curved {filepath}")

if __name__ == "__main__":
    for f in files_to_curve:
        curve_slightly(f)
    print("All dashboards updated with slight curves.")
