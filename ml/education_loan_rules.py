
class EducationLoanScorer:
    """
    Implements intelligent education loan approval logic based on HDFC-style criteria.
    """
    
    def evaluate(self, data):
        # Extract inputs
        academic_score = float(data.get('student_marks', 0))
        course_type = data.get('course_type', 'Others')
        college_tier = data.get('college_tier', 'Tier 3')
        parent_income = float(data.get('monthly_income', 0))
        credit_score = int(data.get('credit_score', 0))
        loan_amount = float(data.get('loan_amount', 0))
        course_duration = int(data.get('course_duration', 3))

        # 1. Income Check
        if parent_income < 20000:
            return self._reject("Parent monthly income is below the ₹20,000 threshold required for co-applicant eligibility.")

        # 2. Credit Score Check
        if credit_score < 650:
            return self._reject(f"Co-applicant credit score ({credit_score}) is below the minimum required 650.")

        # 3. Academic Strength
        academic_risk = "High" if academic_score < 50 else ("Average" if academic_score < 70 else "Low")
        if academic_score < 50:
            return self._reject(f"Academic score ({academic_score}%) is below the minimum requirement for educational financing.")

        # 4. Course Value Analysis
        course_risk_map = {
            'Engineering': 'Low',
            'Medical': 'Low',
            'MBA': 'Medium',
            'Arts': 'High',
            'Others': 'High'
        }
        course_risk = course_risk_map.get(course_type, 'High')

        # 5. College Tier Impact
        tier_risk_map = {
            'Tier 1': 'Low',
            'Tier 2': 'Medium',
            'Tier 3': 'High'
        }
        tier_risk = tier_risk_map.get(college_tier, 'High')

        # 6. Placement Probability (Simulated AI Logic)
        prob = 50 # Base
        if academic_score >= 85: prob += 20
        elif academic_score >= 70: prob += 10
        
        if college_tier == 'Tier 1': prob += 20
        elif college_tier == 'Tier 2': prob += 10
        
        if course_type in ['Engineering', 'Medical']: prob += 10
        
        placement_prob = min(prob, 98)

        # 7. Future Salary Estimation
        salary_map = {
            'Engineering': '₹4–8 LPA',
            'MBA': '₹6–12 LPA',
            'Medical': '₹8–15 LPA',
            'Arts': '₹2–5 LPA',
            'Others': '₹2–5 LPA'
        }
        expected_salary = salary_map.get(course_type, '₹2–5 LPA')

        # 8. Loan Safety Check
        # Convert salary range to average yearly for calculation
        salary_high = float(expected_salary.split('–')[1].split(' ')[0].replace('₹', '')) if '–' in expected_salary else 5.0
        if loan_amount > salary_high * 100000 * 3: # Loan should not exceed 3x potential starting annual salary
            safety_warning = True
        else:
            safety_warning = False

        # 9. Collateral Rule
        collateral_required = "Yes" if loan_amount > 750000 else "No"

        # 10. Moratorium
        moratorium_period = f"{course_duration} years + 6 months"

        # 11. Risk Classification & Final Status
        risk_level = "Medium"
        status = "Review Required"
        
        # Low Risk conditions
        if academic_risk == "Low" and credit_score >= 750 and tier_risk == "Low" and course_risk == "Low":
            risk_level = "Low"
            status = "Approved"
        # High Risk conditions
        elif (academic_risk == "High" or credit_score < 680 or tier_risk == "High") and collateral_required == "No":
            risk_level = "High"
            status = "Review Required" # Education loans rarely hard-reject if income/credit pass, they ask for collateral
        
        if safety_warning:
            risk_level = "High"
            status = "Review Required"

        # 12. Recommendation
        recommendations = []
        if collateral_required == "Yes":
            recommendations.append("Provide tangible collateral (Property/Fixed Deposit) to proceed with high-value funding.")
        if credit_score < 750:
            recommendations.append("Improving co-applicant credit score could lead to lower interest rates.")
        if safety_warning:
            recommendations.append(f"Suggested loan amount: ₹{salary_high * 2 * 100000:,.0f} for better debt-to-income balance.")

        reason = f"Application evaluated as {risk_level} Risk. Basis: {academic_score}% marks in {course_type} at a {college_tier} institution."
        if safety_warning:
            reason += " Note: Requested amount is high relative to projected future earnings."

        return {
            "status": status,
            "riskLevel": risk_level,
            "placementProbability": f"{placement_prob}%",
            "expectedSalary": expected_salary,
            "moratoriumPeriod": moratorium_period,
            "collateralRequired": collateral_required,
            "reason": reason,
            "recommendedLoanAmount": salary_high * 2 * 100000 if safety_warning else None,
            "recommendations": recommendations
        }

    def _reject(self, reason):
        return {
            "status": "Rejected",
            "riskLevel": "High",
            "placementProbability": "0%",
            "expectedSalary": "N/A",
            "moratoriumPeriod": "N/A",
            "collateralRequired": "N/A",
            "reason": reason,
            "recommendedLoanAmount": None
        }
