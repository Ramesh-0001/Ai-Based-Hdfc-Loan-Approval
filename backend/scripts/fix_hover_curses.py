import re

# 1. Update Admin Dashboard Sidebar
def fix_admin_dashboard():
    filepath = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\AdminDashboard.jsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Sidebar item hover
    content = content.replace('hover:text-gray-900 hover:bg-slate-100', 'hover:text-blue-600 hover:bg-blue-50')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


# 2. Update Officer Dashboard
def fix_officer_dashboard():
    filepath = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\InstitutionalDashboard.jsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Sidebar item hover
    content = content.replace('hover:bg-slate-100 hover:text-gray-900', 'hover:bg-blue-50 hover:text-blue-600')
    content = content.replace('hover:bg-slate-100 hover:text-white', 'hover:bg-blue-50 hover:text-blue-600')

    # Remove curvature (rounded-xl, rounded-lg, rounded-[32px], rounded-md, rounded-2xl to rounded-none)
    content = re.sub(r'\brounded-xl\b', 'rounded-sm', content)
    content = re.sub(r'\brounded-lg\b', 'rounded-sm', content)
    content = re.sub(r'\brounded-2xl\b', 'rounded-sm', content)
    content = re.sub(r'\brounded-\[32px\]\b', 'rounded-sm', content)
    content = re.sub(r'\brounded-\[40px\]\b', 'rounded-sm', content)
    content = re.sub(r'\brounded-3xl\b', 'rounded-sm', content)

    # Some elements might need to be fully square (rounded-none) but rounded-sm is usually a safe "un-curved" look.
    # We will replace rounded-sm with rounded-none just in case the user meant completely sharp corners.
    content = content.replace('rounded-sm', 'rounded-none')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


# 3. Update Applicant Dashboard Sidebar
def fix_applicant_dashboard():
    filepath = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\layout\Sidebar.jsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Sidebar hover
    content = content.replace('hover:bg-slate-100 hover:text-white', 'hover:bg-blue-50 hover:text-blue-600')
    # Because my earlier script replaced hover:bg-slate-100 without text-gray-900, let's fix it properly using a regex.
    content = re.sub(r'text-gray-600 hover:bg-slate-100( hover:text-gray-900)?', 'text-gray-600 hover:bg-blue-50 hover:text-blue-600', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


if __name__ == "__main__":
    fix_admin_dashboard()
    fix_officer_dashboard()
    fix_applicant_dashboard()
    print("UI Adjustments Complete!")
