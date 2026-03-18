import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    orig_content = content
    
    # Backdrop replacements: bg-gray-900/40, bg-gray-900/60 etc. -> bg-slate-900/20
    content = re.sub(r'bg-gray-900/(40|60|80)', 'bg-slate-900/20', content)
    
    # 32px / 40px radius -> xl
    content = re.sub(r'rounded-\[(24|32|40)px\]', 'rounded-xl', content)
    content = re.sub(r'rounded-3xl', 'rounded-xl', content)
    content = re.sub(r'rounded-2xl', 'rounded-xl', content)
    
    # Dark card replacements
    content = content.replace(
        'bg-gray-900 rounded-xl p-6 text-white',
        'bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
    )
    content = content.replace(
        'bg-gray-900 rounded-[40px] p-6 text-white',
        'bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
    )
    content = content.replace(
        'bg-gray-900 rounded-[32px] p-6 text-white',
        'bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
    )
    content = content.replace(
        'bg-gray-900 rounded-3xl p-6 text-white',
        'bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
    )
    
    # Any other dark cards matching the pattern
    content = re.sub(
        r'bg-white border border-gray-200(.*?)text-white',
        r'bg-white border border-gray-200\g<1>',
        content
    )
    
    # AdminLogin specific
    content = content.replace('w-10 h-10 bg-gray-900', 'w-10 h-10 bg-blue-50 text-blue-600')
    
    # AIChatAssistant specific 
    content = content.replace('bg-gray-900 rotate-90', 'bg-slate-100 rotate-90 text-gray-900')
    
    # Fallback for remaining bg-gray-900
    content = content.replace('bg-gray-900', 'bg-white border text-gray-900')
    
    # Make sure text inside cards is gray
    content = content.replace('text-blue-200', 'text-blue-600')
    content = content.replace('text-blue-300', 'text-blue-600')
    content = content.replace('text-white/60', 'text-gray-500')
    content = content.replace('text-white/50', 'text-gray-400')
    content = content.replace('text-white/70', 'text-gray-600')
    content = content.replace('text-white/80', 'text-gray-700')
    content = content.replace('text-white/90', 'text-gray-900')
    content = content.replace('border-white/10', 'border-gray-200')
    content = content.replace('border-white/20', 'border-gray-200')
    content = content.replace('border border-gray-800', 'border border-gray-200')

    # Remove duplicates from string replacements
    content = content.replace('border border-gray-200 border border-gray-200', 'border border-gray-200')
    
    if content != orig_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated component: {filepath}")

def main():
    directory = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components"
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx'):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
