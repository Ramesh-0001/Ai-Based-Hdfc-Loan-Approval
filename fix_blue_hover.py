import re

# We will apply definitive exact styling for sidebars so the user sees clear blue.
# Active state: bg-blue-600 text-white
# Hover state: hover:bg-blue-600 hover:text-white

def apply_solid_blue():
    # 1. Admin Dashboard
    admin_path = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\AdminDashboard.jsx"
    with open(admin_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace active state and hover state on the sidebar items
    content = content.replace("activeTab === item.name ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'",
                              "activeTab === item.name ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-600 hover:text-white'")
    with open(admin_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # 2. Institutional Dashboard
    inst_path = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\InstitutionalDashboard.jsx"
    with open(inst_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The string here has newlines, so regex is safer.
    content = re.sub(
        r"\?\s*'bg-blue-50 text-blue-600'\s*:\s*'text-gray-600 hover:bg-blue-50 hover:text-blue-600'",
        "? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-600 hover:text-white'",
        content,
        flags=re.MULTILINE
    )
    # Also adjust the icon color to be white when hovered or active
    # For Institutional it uses: className={active ? 'text-blue-600' : 'text-gray-500'}
    # we can leave it or make it inherit with group-hover. Let's make it group-hover compliant or just rely on inherited text-white.
    content = content.replace("className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium transition-all duration-200 ${",
                              "className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium transition-all duration-200 ${")
    content = content.replace("className={active ? 'text-blue-600' : 'text-gray-500'}",
                              "className={active ? 'text-white' : 'text-gray-500 group-hover:text-white'}")
                              
    with open(inst_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # 3. Applicant Dashboard
    app_path = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\layout\Sidebar.jsx"
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(
        r"\?\s*'bg-blue-50 text-blue-600 font-medium'\s*:\s*'text-gray-600 hover:bg-blue-50 hover:text-blue-600'",
        "? 'bg-blue-600 text-white font-medium' : 'text-gray-600 hover:bg-blue-600 hover:text-white'",
        content,
        flags=re.MULTILINE
    )
    # Similar for icon
    content = content.replace("className={`transition-colors ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}",
                              "className={`transition-colors ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}")
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    apply_solid_blue()
    print("Done")
