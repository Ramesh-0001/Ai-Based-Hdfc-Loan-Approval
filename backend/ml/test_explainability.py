"""
Loan Approval Explainability Demo
Demonstrates how to analyze rejected applications and suggest improvements
"""

from risk_scorer import RiskScorer
from feature_schema import FeatureEngineer
import pandas as pd


def print_section(title):
    """Print formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def analyze_rejection(applicant_data, scorer):
    """Analyze why an application was rejected"""
    print_section("ORIGINAL APPLICATION ANALYSIS")
    
    # Calculate risk score
    result = scorer.calculate_risk_score(applicant_data)
    
    print(f"\n📊 RISK SCORE: {result['risk_score']}/100")
    print(f"🚦 DECISION: {result['approval_status']}")
    
    print("\n📈 Score Breakdown:")
    for component, score in result['score_breakdown'].items():
        max_scores = {
            'credit_score': 35,
            'income_stability': 25,
            'dti_ratio': 20,
            'loan_to_income': 15,
            'stability_factors': 5
        }
        max_score = max_scores.get(component, 100)
        percentage = (score / max_score) * 100
        bar = "█" * int(percentage / 5) + "░" * (20 - int(percentage / 5))
        print(f"  {component.replace('_', ' ').title():25} {score:5.2f}/{max_score:2} [{bar}] {percentage:.0f}%")
    
    print("\n💡 Key Metrics:")
    for metric, value in result['derived_features'].items():
        if metric in ['dti_ratio', 'loan_to_income_ratio', 'emi_burden', 'employment_stability_score']:
            print(f"  {metric.replace('_', ' ').title():30} {value}")
    
    print("\n🔍 Reasoning:")
    for reason in result['reasoning']:
        print(f"  {reason}")
    
    return result


def identify_improvement_areas(result, applicant_data):
    """Identify which factors need improvement"""
    print_section("IMPROVEMENT OPPORTUNITIES")
    
    breakdown = result['score_breakdown']
    improvements = []
    
    # Analyze each component
    if breakdown['credit_score'] < 28:
        improvements.append({
            'area': 'Credit Score',
            'current_score': breakdown['credit_score'],
            'max_score': 35,
            'priority': 'HIGH',
            'suggestion': 'Increase credit score to 750+ for maximum points'
        })
    
    if breakdown['income_stability'] < 20:
        improvements.append({
            'area': 'Income Stability',
            'current_score': breakdown['income_stability'],
            'max_score': 25,
            'priority': 'HIGH',
            'suggestion': 'Increase income or improve employment stability'
        })
    
    if breakdown['dti_ratio'] < 15:
        improvements.append({
            'area': 'Debt-to-Income Ratio',
            'current_score': breakdown['dti_ratio'],
            'max_score': 20,
            'priority': 'CRITICAL',
            'suggestion': 'Reduce existing EMIs or increase income'
        })
    
    if breakdown['loan_to_income'] < 11:
        improvements.append({
            'area': 'Loan-to-Income Ratio',
            'current_score': breakdown['loan_to_income'],
            'max_score': 15,
            'priority': 'MEDIUM',
            'suggestion': 'Reduce loan amount or increase income'
        })
    
    # Sort by priority
    priority_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    improvements.sort(key=lambda x: priority_order[x['priority']])
    
    print("\n🎯 Areas Needing Improvement (Prioritized):\n")
    for i, imp in enumerate(improvements, 1):
        print(f"{i}. [{imp['priority']}] {imp['area']}")
        print(f"   Current: {imp['current_score']:.2f}/{imp['max_score']} points")
        print(f"   💡 {imp['suggestion']}\n")
    
    return improvements


def suggest_adjustments(applicant_data, improvements, result):
    """Suggest specific adjustments to get approval"""
    print_section("SUGGESTED ADJUSTMENTS")
    
    adjusted = applicant_data.copy()
    changes = []
    
    # Get current metrics
    dti = result['derived_features']['dti_ratio']
    lti = result['derived_features']['loan_to_income_ratio']
    
    # Strategy: Focus on highest impact changes
    
    # 1. Improve Credit Score (if needed)
    if applicant_data['credit_score'] < 750:
        old_score = applicant_data['credit_score']
        adjusted['credit_score'] = 760  # Target excellent range
        changes.append({
            'field': 'Credit Score',
            'old': old_score,
            'new': 760,
            'impact': '+8 to +15 points',
            'how': 'Pay off credit cards, dispute errors, maintain low utilization'
        })
    
    # 2. Reduce DTI (if high)
    if dti > 40:
        # Option A: Reduce existing EMIs
        old_emis = applicant_data['monthly_existing_emis']
        new_emis = old_emis * 0.5  # Reduce by 50%
        adjusted['monthly_existing_emis'] = int(new_emis)
        changes.append({
            'field': 'Monthly Existing EMIs',
            'old': f'₹{old_emis:,.0f}',
            'new': f'₹{new_emis:,.0f}',
            'impact': '+5 to +10 points',
            'how': 'Pay off or consolidate existing loans'
        })
    
    # 3. Reduce Loan Amount (if LTI is high)
    if lti > 4:
        old_amount = applicant_data['loan_amount']
        new_amount = int(applicant_data['annual_income'] * 3)  # Target 3x income
        adjusted['loan_amount'] = new_amount
        changes.append({
            'field': 'Loan Amount',
            'old': f'₹{old_amount:,.0f}',
            'new': f'₹{new_amount:,.0f}',
            'impact': '+3 to +7 points',
            'how': 'Request lower loan amount or increase down payment'
        })
    
    # 4. Increase Income (if possible)
    if applicant_data['annual_income'] < 1000000:
        old_income = applicant_data['annual_income']
        new_income = int(old_income * 1.3)  # 30% increase
        adjusted['annual_income'] = new_income
        changes.append({
            'field': 'Annual Income',
            'old': f'₹{old_income:,.0f}',
            'new': f'₹{new_income:,.0f}',
            'impact': '+5 to +12 points',
            'how': 'Include co-applicant income, bonuses, or other income sources'
        })
    
    # 5. Improve Employment Stability
    if applicant_data['years_in_current_job'] < 2:
        old_years = applicant_data['years_in_current_job']
        adjusted['years_in_current_job'] = 3.0
        changes.append({
            'field': 'Years in Current Job',
            'old': f'{old_years:.1f} years',
            'new': '3.0 years',
            'impact': '+2 to +5 points',
            'how': 'Wait until you have more job stability, or show total experience'
        })
    
    print("\n📝 Recommended Changes:\n")
    for i, change in enumerate(changes, 1):
        print(f"{i}. {change['field']}")
        print(f"   Current:  {change['old']}")
        print(f"   Adjusted: {change['new']}")
        print(f"   Impact:   {change['impact']}")
        print(f"   How:      {change['how']}\n")
    
    return adjusted, changes


def compare_results(original_data, adjusted_data, scorer):
    """Compare original vs adjusted application"""
    print_section("COMPARISON: ORIGINAL vs ADJUSTED")
    
    original_result = scorer.calculate_risk_score(original_data)
    adjusted_result = scorer.calculate_risk_score(adjusted_data)
    
    print(f"\n{'Metric':<30} {'Original':<20} {'Adjusted':<20} {'Change':<15}")
    print("-" * 85)
    
    # Risk Score
    orig_score = original_result['risk_score']
    adj_score = adjusted_result['risk_score']
    change = adj_score - orig_score
    print(f"{'Risk Score':<30} {orig_score:<20.2f} {adj_score:<20.2f} {change:+.2f} ✓")
    
    # Approval Status
    print(f"{'Approval Status':<30} {original_result['approval_status']:<20} {adjusted_result['approval_status']:<20}")
    
    print("\n" + "-" * 85)
    print("Score Component Breakdown:")
    print("-" * 85)
    
    for component in original_result['score_breakdown'].keys():
        orig = original_result['score_breakdown'][component]
        adj = adjusted_result['score_breakdown'][component]
        change = adj - orig
        symbol = "✓" if change > 0 else "→"
        print(f"{component.replace('_', ' ').title():<30} {orig:<20.2f} {adj:<20.2f} {change:+.2f} {symbol}")
    
    print("\n" + "-" * 85)
    print("Key Metrics:")
    print("-" * 85)
    
    metrics = ['dti_ratio', 'loan_to_income_ratio', 'emi_burden']
    for metric in metrics:
        if metric in original_result['derived_features']:
            orig = original_result['derived_features'][metric]
            adj = adjusted_result['derived_features'][metric]
            change = adj - orig
            symbol = "✓" if change < 0 else "→"  # Lower is better for these
            print(f"{metric.replace('_', ' ').title():<30} {orig:<20.2f} {adj:<20.2f} {change:+.2f} {symbol}")
    
    return original_result, adjusted_result


def main():
    """Run the explainability demo"""
    scorer = RiskScorer()
    
    print("\n" + "█" * 80)
    print("  LOAN APPROVAL EXPLAINABILITY SYSTEM - DEMO")
    print("  Analyzing Rejected Application & Suggesting Improvements")
    print("█" * 80)
    
    # Example: Rejected applicant (from our dataset)
    rejected_applicant = {
        'age': 28,
        'annual_income': 400000,  # Low income
        'credit_score': 620,  # Below ideal
        'employment_type': 'Freelancer',  # Less stable
        'loan_amount': 1500000,  # High relative to income
        'monthly_existing_emis': 12000,  # Existing debt
        'loan_purpose': 'Personal',  # Higher risk purpose
        'loan_tenure_months': 60,
        'years_in_current_job': 0.5,  # Low stability
        'total_work_experience': 3,
        'existing_loan_count': 3,  # Multiple loans
        'residential_status': 'Rented',
        'number_of_dependents': 1,
        'city_tier': 'Tier-2',
        'education_level': 'Graduate',
        'marital_status': 'Single',
        'bank_account_vintage_months': 18
    }
    
    # Step 1: Analyze the rejection
    result = analyze_rejection(rejected_applicant, scorer)
    
    # Step 2: Identify improvement areas
    improvements = identify_improvement_areas(result, rejected_applicant)
    
    # Step 3: Suggest adjustments
    adjusted_applicant, changes = suggest_adjustments(rejected_applicant, improvements, result)
    
    # Step 4: Compare results
    original_result, adjusted_result = compare_results(rejected_applicant, adjusted_applicant, scorer)
    
    # Final Summary
    print_section("FINAL RECOMMENDATION")
    
    if adjusted_result['approval_status'] == 'APPROVED':
        print("\n✅ SUCCESS! With the suggested adjustments, the application would be APPROVED!")
        print(f"\n   Risk Score improved from {original_result['risk_score']:.2f} to {adjusted_result['risk_score']:.2f}")
        print(f"   Gain: +{adjusted_result['risk_score'] - original_result['risk_score']:.2f} points")
    elif adjusted_result['approval_status'] == 'MANUAL_REVIEW':
        print("\n⚠️  IMPROVED! Application moved to MANUAL REVIEW (from REJECTED)")
        print(f"\n   Risk Score improved from {original_result['risk_score']:.2f} to {adjusted_result['risk_score']:.2f}")
        print(f"   Gain: +{adjusted_result['risk_score'] - original_result['risk_score']:.2f} points")
        print("\n   Additional improvements needed to reach auto-approval (71+ score)")
    else:
        print("\n❌ Still rejected, but score improved")
        print(f"\n   Risk Score improved from {original_result['risk_score']:.2f} to {adjusted_result['risk_score']:.2f}")
    
    print("\n" + "█" * 80)
    print("\n💡 Key Takeaways:")
    print("   1. Credit score has the highest impact (35% weight)")
    print("   2. Reducing DTI ratio is critical for approval")
    print("   3. Loan amount should be 2-4x annual income")
    print("   4. Employment stability matters significantly")
    print("   5. Multiple small improvements compound to approval")
    print("\n" + "█" * 80 + "\n")


if __name__ == "__main__":
    main()
