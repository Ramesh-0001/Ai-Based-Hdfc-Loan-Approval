from dotenv import load_dotenv
import os

load_dotenv()

path = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\InstitutionalDashboard.jsx"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
inserted_audit = False

for line in lines:
    if '{app.riskLevel || \'MEDIUM\'} RISK TIER' in line:
        line = line.replace('{app.riskLevel || \'MEDIUM\'} RISK TIER', '{(app.fraud_score > 30 || app.confidenceScore < 60) ? \'SUSPECT\' : (app.riskLevel || \'MEDIUM\')} AUDIT TIER')
    new_lines.append(line)
    
    # Insert component call after the close of the div
    if 'RISK TIER</span>' in line and not inserted_audit:
        # We need to find the parent div close.
        # But we know it's just a few lines down (line 900 in view output)
        pass

# Second pass for the component insertion
final_lines = []
for i, line in enumerate(new_lines):
    final_lines.append(line)
    if 'AUDIT TIER</span>' in line:
        # The next line is </div>, then we want to insert <DataVerificationAudit />
        # Let's look ahead
        if i + 1 < len(new_lines) and '</div>' in new_lines[i+1]:
            if i + 2 < len(new_lines) and '</div>' in new_lines[i+2]:
                final_lines.append(new_lines[i+1])
                final_lines.append(new_lines[i+2])
                final_lines.append('\n              <DataVerificationAudit app={app} />\n')
                # Skip the lines we just added manually
                # Actually, this is getting complex.
                pass

# Let's try a simpler approach
content = "".join(lines)
old_block = """                    <span className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider">{app.riskLevel || 'MEDIUM'} RISK TIER</span>
                 </div>
              </div>"""

new_block = """                    <span className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider">{(app.fraud_score > 30 || app.confidenceScore < 60) ? 'SUSPECT' : (app.riskLevel || 'MEDIUM')} AUDIT TIER</span>
                 </div>
              </div>

              <DataVerificationAudit app={app} />"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replacement Successful")
else:
    # Try with different line endings
    old_block_crlf = old_block.replace('\n', '\r\n')
    if old_block_crlf in content:
        content = content.replace(old_block_crlf, new_block.replace('\n', '\r\n'))
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Replacement Successful (CRLF)")
    else:
        print("Block not found")
