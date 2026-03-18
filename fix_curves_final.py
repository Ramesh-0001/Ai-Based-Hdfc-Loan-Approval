import re

filepath = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\InstitutionalDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any remaining rounded-[XXpx] with rounded-none
content = re.sub(r'\brounded-\[\d+px\]\b', 'rounded-none', content)
content = re.sub(r'\brounded-md\b', 'rounded-none', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
