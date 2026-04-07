import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    orig_content = content

    # 1. Spacing Fixes
    # p-8, p-10, p-12, p-16 -> p-6
    content = re.sub(r'\bp-(8|10|12|16|20)\b', 'p-6', content)
    # py-8, py-10, py-12, py-16 -> py-6
    content = re.sub(r'\bpy-(8|10|12|16|20)\b', 'py-6', content)
    # px-8, px-10, px-12, px-16 -> px-6
    content = re.sub(r'\bpx-(8|10|12|16|20)\b', 'px-6', content)
    # gap-8, gap-10, gap-12 -> gap-6
    content = re.sub(r'\bgap-(8|10|12|16)\b', 'gap-6', content)
    # mb-8, mb-10, mb-12, mb-16, mb-24 -> mb-6
    content = re.sub(r'\bmb-(8|10|12|16|20|24)\b', 'mb-6', content)
    # mt-8, mt-10, mt-12, mt-16 -> mt-6
    content = re.sub(r'\bmt-(8|10|12|16|20|24)\b', 'mt-6', content)
    # space-y-8, space-y-10, space-y-12 -> space-y-6
    content = re.sub(r'\bspace-y-(8|10|12)\b', 'space-y-6', content)

    # 2. Typography Fixes
    # text-3xl, text-4xl, text-5xl -> text-2xl
    content = re.sub(r'\btext-(3xl|4xl|5xl|6xl|7xl|8xl)\b', 'text-2xl', content)
    # font-bold, font-black, font-extrabold -> font-semibold
    content = re.sub(r'\bfont-(bold|black|extrabold)\b', 'font-semibold', content)

    # 3. Card Styles & Shadows
    # shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-2xl -> standard shadow
    # Wait, simple replace might duplicate. Let's clean all standard shadows and replace them
    # Ensure not to replace our newly added custom shadows if script is run twice
    content = re.sub(r'\bshadow-(sm|md|lg|xl|2xl)\b', 'shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]', content)
    # If the custom shadow is there multiple times, we might need a better regex, 
    # but since this runs once, it's fine. We can clean up duplicate transitions later.
    content = content.replace('hover:scale-[1.01] hover:scale-[1.01]', 'hover:scale-[1.01]')
    content = content.replace('transition-all duration-200 transition-all duration-200', 'transition-all duration-200')

    # 4. Background and Borders
    # bg-[#f8fafc] / bg-gray-50 -> bg-slate-50
    content = content.replace('bg-[#f8fafc]', 'bg-slate-50')
    content = content.replace('bg-gray-50', 'bg-slate-50')
    
    # border-gray-100, border-gray-50 -> border-gray-200
    content = content.replace('border-gray-50', 'border-gray-200')
    content = content.replace('border-gray-100', 'border-gray-200')
    
    # 5. Sidebar & Navigation (Premium White Style)
    # The sidebar is usually `<aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-slate-100 flex flex-col z-50">`
    # Replace sidebar bg-gray-900 with bg-white
    content = content.replace('bg-gray-900 flex flex-col', 'bg-white border-r border-gray-200 flex flex-col')
    content = content.replace('bg-gray-900 text-white', 'bg-white border-r border-gray-200')
    
    # Text in sidebar might be text-white, replace broadly where applicable, but risky. Let's do targeted:
    # `text-white hover:text-blue-200` type things. Let's do common active standard classes
    content = content.replace('bg-blue-600 text-white shadow-md', 'bg-blue-50 text-blue-600')
    content = content.replace('bg-gray-800 text-white', 'bg-slate-100 text-gray-900')
    content = content.replace('text-gray-400 hover:bg-gray-800', 'text-gray-600 hover:bg-slate-100')
    content = content.replace('text-gray-400 hover:text-white', 'text-gray-600 hover:text-gray-900')
    
    # General gray-900 bg (which we just added previously to sidebars) to be removed from asides
    # We can use regex to find aside tags and replace bg-gray-900 with bg-white border-r border-gray-200
    def replace_aside_bg(match):
        aside = match.group(0)
        return aside.replace('bg-gray-900', 'bg-white border-r border-gray-200')
    content = re.sub(r'<aside\b[^>]*>', replace_aside_bg, content)

    if content != orig_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    directory = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components"
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx'):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
