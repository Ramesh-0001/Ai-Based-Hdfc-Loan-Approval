import re

filepath = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\InstitutionalDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all rounded-xl, rounded-lg, rounded-2xl, rounded-3xl, rounded-[...], rounded-md with rounded-none
# We keep rounded-full for things like indicators/avatars unless it's clear they want those squared too.
# But "box corner" usually means the main cards.
content = re.sub(r'\brounded-(xl|lg|2xl|3xl|md|sm)\b', 'rounded-none', content)
content = re.sub(r'\brounded-\[\d+px\]\b', 'rounded-none', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("InstitutionalDashboard squared.")
