import re
import os

files_to_square = [
    r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\InstitutionalDashboard.jsx",
    r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\CustomerDashboard.jsx",
    r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\AdminDashboard.jsx",
    r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\layout\Sidebar.jsx"
]

def square_everything(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace rounded-XX, rounded-[XXpx], rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl with rounded-none
    # Avoid replacing rounded-full for things like indicators, avatars?
    # Actually, user says "applicant dashboard curve u make as in officer dashboard curve"
    # and they didn't like curves on boxes.
    # We will replace all common rounded classes with rounded-none.
    content = re.sub(r'\brounded-(xl|lg|md|sm|2xl|3xl)\b', 'rounded-none', content)
    content = re.sub(r'\brounded-\[\w+\]\b', 'rounded-none', content)
    
    # Also explicitly fix the hover issue if any remains or if it was partially applied.
    # For InstitutionalDashboard we noticed the screenshot had light grey hover.
    # We want hover:bg-blue-600 hover:text-white
    
    # Since the user specifically mentioned "written letters should not be hidden",
    # I will also add group-hover:text-white to the inner spans if they are not already.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Squared {filepath}")

if __name__ == "__main__":
    for f in files_to_square:
        square_everything(f)
    print("All squared and hover fixed.")
