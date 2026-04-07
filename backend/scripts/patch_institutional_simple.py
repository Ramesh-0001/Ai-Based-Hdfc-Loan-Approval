import os

path = r"e:\VS-Code\HDFC-Ai-Loan-Predictor\components\InstitutionalDashboard.jsx"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if 'RISK TIER' in line and '{app.riskLevel' in line:
        # Replacement with dynamic tier
        line = line.replace('{app.riskLevel || \'MEDIUM\'} RISK TIER', '{(app.fraud_score > 30 || app.confidenceScore < 60) ? \'SUSPECT\' : (app.riskLevel || \'MEDIUM\')} AUDIT TIER')
        new_lines.append(line)
        # Scan forward for the closing div
        for j in range(i+1, min(i+10, len(lines))):
            if '</div>' in lines[j]:
                # Found one </div>. Continue for the second one
                for k in range(j+1, min(j+10, len(lines))):
                    if '</div>' in lines[k]:
                        # Insert after this </div>
                        lines[k] += '\n              <DataVerificationAudit app={app} />\n'
                        break
                break
    else:
        new_lines.append(line)

with open(path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("Updated successfully via line scan")
