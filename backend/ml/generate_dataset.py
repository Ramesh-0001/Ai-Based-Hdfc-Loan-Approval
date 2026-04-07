"""
Synthetic Dataset Generator for Loan Approval System
Generates realistic training data with proper correlations and distributions
"""

import numpy as np
import pandas as pd
from typing import Dict, List
import random
from feature_schema import (
    EmploymentType, LoanPurpose, ResidentialStatus, 
    CityTier, EducationLevel, MaritalStatus, FeatureEngineer
)
from risk_scorer import RiskScorer


class SyntheticDataGenerator:
    """Generate realistic loan application data"""
    
    def __init__(self, seed: int = 42):
        """Initialize generator with random seed for reproducibility"""
        np.random.seed(seed)
        random.seed(seed)
        self.engineer = FeatureEngineer()
        self.scorer = RiskScorer()
    
    def generate_age(self, n: int) -> np.ndarray:
        """Generate ages with normal distribution (μ=35, σ=10)"""
        ages = np.random.normal(35, 10, n)
        return np.clip(ages, 21, 70).astype(int)
    
    def generate_income(self, n: int, education: np.ndarray, 
                       employment: np.ndarray, age: np.ndarray) -> np.ndarray:
        """
        Generate income with log-normal distribution
        Correlated with education, employment type, and age
        """
        # Base income (log-normal distribution)
        base_income = np.random.lognormal(13.5, 0.6, n)
        
        # Education multiplier
        education_multiplier = np.ones(n)
        for i, edu in enumerate(education):
            if edu == "Professional":
                education_multiplier[i] = 1.5
            elif edu == "Post-Graduate":
                education_multiplier[i] = 1.3
            elif edu == "Graduate":
                education_multiplier[i] = 1.0
            else:
                education_multiplier[i] = 0.7
        
        # Employment multiplier
        employment_multiplier = np.ones(n)
        for i, emp in enumerate(employment):
            if emp == "Government":
                employment_multiplier[i] = 1.2
            elif emp == "Salaried":
                employment_multiplier[i] = 1.0
            elif emp == "Self-Employed":
                employment_multiplier[i] = 1.1
            else:  # Freelancer
                employment_multiplier[i] = 0.8
        
        # Age bonus (experience)
        age_multiplier = 1 + ((age - 21) / 100)
        
        income = base_income * education_multiplier * employment_multiplier * age_multiplier
        return np.clip(income, 300000, 50000000).astype(int)
    
    def generate_credit_score(self, n: int, income: np.ndarray, 
                             age: np.ndarray) -> np.ndarray:
        """
        Generate credit scores with beta distribution
        Correlated with income and age (higher income/age → better credit)
        """
        # Base credit score (beta distribution skewed toward 650-750)
        base_scores = np.random.beta(5, 3, n) * 550 + 300
        
        # Income correlation
        income_normalized = (income - 300000) / (5000000 - 300000)
        income_bonus = income_normalized * 100
        
        # Age correlation (older → more credit history)
        age_bonus = ((age - 21) / (70 - 21)) * 50
        
        credit_scores = base_scores + income_bonus + age_bonus
        return np.clip(credit_scores, 300, 850).astype(int)
    
    def generate_employment_type(self, n: int) -> np.ndarray:
        """Generate employment types with realistic distribution"""
        types = [e.value for e in EmploymentType]
        probabilities = [0.15, 0.60, 0.20, 0.05]  # Gov, Salaried, Self-Emp, Freelancer
        return np.random.choice(types, n, p=probabilities)
    
    def generate_loan_amount(self, n: int, income: np.ndarray, 
                            loan_purpose: np.ndarray) -> np.ndarray:
        """
        Generate loan amounts correlated with income and purpose
        Typical range: 2-5x annual income
        """
        # Base multiplier (2-5x income)
        base_multiplier = np.random.uniform(1.5, 5.0, n)
        
        # Purpose adjustment
        purpose_multiplier = np.ones(n)
        for i, purpose in enumerate(loan_purpose):
            if purpose == "Home":
                purpose_multiplier[i] = 2.0  # Home loans are larger
            elif purpose == "Education":
                purpose_multiplier[i] = 0.8
            elif purpose == "Vehicle":
                purpose_multiplier[i] = 0.5
            elif purpose == "Personal":
                purpose_multiplier[i] = 0.6
            elif purpose == "Business":
                purpose_multiplier[i] = 1.5
            else:  # Medical
                purpose_multiplier[i] = 0.4
        
        loan_amounts = income * base_multiplier * purpose_multiplier
        return np.clip(loan_amounts, 50000, 10000000).astype(int)
    
    def generate_existing_emis(self, n: int, income: np.ndarray, 
                              existing_loans: np.ndarray) -> np.ndarray:
        """Generate existing EMIs based on income and loan count"""
        monthly_income = income / 12
        
        emis = np.zeros(n)
        for i in range(n):
            if existing_loans[i] > 0:
                # EMI burden typically 10-40% of income
                emi_ratio = np.random.uniform(0.1, 0.4)
                emis[i] = monthly_income[i] * emi_ratio
        
        return np.clip(emis, 0, 200000).astype(int)
    
    def generate_loan_purpose(self, n: int) -> np.ndarray:
        """Generate loan purposes with realistic distribution"""
        purposes = [p.value for p in LoanPurpose]
        probabilities = [0.30, 0.15, 0.25, 0.15, 0.10, 0.05]  # Home, Edu, Personal, Business, Medical, Vehicle
        return np.random.choice(purposes, n, p=probabilities)
    
    def generate_loan_tenure(self, n: int, loan_purpose: np.ndarray) -> np.ndarray:
        """Generate loan tenure based on purpose"""
        tenures = np.zeros(n, dtype=int)
        
        for i, purpose in enumerate(loan_purpose):
            if purpose == "Home":
                tenures[i] = np.random.choice([180, 240, 300, 360])  # 15-30 years
            elif purpose == "Education":
                tenures[i] = np.random.choice([60, 84, 120])  # 5-10 years
            elif purpose == "Vehicle":
                tenures[i] = np.random.choice([36, 48, 60])  # 3-5 years
            elif purpose == "Business":
                tenures[i] = np.random.choice([60, 84, 120, 180])  # 5-15 years
            else:  # Personal, Medical
                tenures[i] = np.random.choice([12, 24, 36, 48, 60])  # 1-5 years
        
        return tenures
    
    def generate_work_experience(self, n: int, age: np.ndarray, 
                                employment: np.ndarray) -> tuple:
        """Generate work experience (total and current job)"""
        # Total experience based on age
        max_experience = age - 21
        total_exp = np.random.uniform(0, 1, n) * max_experience
        
        # Current job tenure (typically less than total)
        current_job_years = np.zeros(n)
        for i in range(n):
            if employment[i] == "Government":
                # Government jobs have longer tenure
                current_job_years[i] = min(
                    np.random.uniform(2, 15),
                    total_exp[i]
                )
            elif employment[i] == "Salaried":
                current_job_years[i] = min(
                    np.random.uniform(0.5, 8),
                    total_exp[i]
                )
            else:  # Self-employed, Freelancer
                current_job_years[i] = min(
                    np.random.uniform(0.5, 10),
                    total_exp[i]
                )
        
        return np.round(total_exp, 1), np.round(current_job_years, 1)
    
    def generate_categorical_features(self, n: int) -> Dict[str, np.ndarray]:
        """Generate all categorical features"""
        return {
            'residential_status': np.random.choice(
                [r.value for r in ResidentialStatus],
                n,
                p=[0.35, 0.40, 0.15, 0.10]  # Owned, Rented, Family, Company
            ),
            'city_tier': np.random.choice(
                [c.value for c in CityTier],
                n,
                p=[0.30, 0.25, 0.25, 0.20]  # Metro, T1, T2, T3
            ),
            'education_level': np.random.choice(
                [e.value for e in EducationLevel],
                n,
                p=[0.15, 0.45, 0.30, 0.10]  # HS, Grad, PG, Prof
            ),
            'marital_status': np.random.choice(
                [m.value for m in MaritalStatus],
                n,
                p=[0.35, 0.55, 0.07, 0.03]  # Single, Married, Divorced, Widowed
            )
        }
    
    def generate_dataset(self, n_samples: int = 5000) -> pd.DataFrame:
        """
        Generate complete synthetic dataset
        
        Args:
            n_samples: Number of samples to generate
        
        Returns:
            DataFrame with all features and risk scores
        """
        print(f"Generating {n_samples} synthetic loan applications...")
        
        # Generate base features
        age = self.generate_age(n_samples)
        education = np.random.choice(
            [e.value for e in EducationLevel],
            n_samples,
            p=[0.15, 0.45, 0.30, 0.10]
        )
        employment = self.generate_employment_type(n_samples)
        
        # Generate income (correlated with education, employment, age)
        income = self.generate_income(n_samples, education, employment, age)
        
        # Generate credit score (correlated with income and age)
        credit_score = self.generate_credit_score(n_samples, income, age)
        
        # Generate loan details
        loan_purpose = self.generate_loan_purpose(n_samples)
        loan_amount = self.generate_loan_amount(n_samples, income, loan_purpose)
        loan_tenure = self.generate_loan_tenure(n_samples, loan_purpose)
        
        # Generate financial details
        existing_loans = np.random.choice([0, 1, 2, 3, 4], n_samples, p=[0.3, 0.35, 0.20, 0.10, 0.05])
        existing_emis = self.generate_existing_emis(n_samples, income, existing_loans)
        
        # Generate work experience
        total_exp, current_job_years = self.generate_work_experience(n_samples, age, employment)
        
        # Generate other features
        categorical = self.generate_categorical_features(n_samples)
        dependents = np.random.choice([0, 1, 2, 3, 4, 5], n_samples, p=[0.20, 0.25, 0.30, 0.15, 0.07, 0.03])
        bank_vintage = np.random.randint(6, 240, n_samples)  # 6 months to 20 years
        
        # Create DataFrame
        df = pd.DataFrame({
            'age': age,
            'annual_income': income,
            'credit_score': credit_score,
            'employment_type': employment,
            'loan_amount': loan_amount,
            'monthly_existing_emis': existing_emis,
            'loan_purpose': loan_purpose,
            'loan_tenure_months': loan_tenure,
            'years_in_current_job': current_job_years,
            'total_work_experience': total_exp,
            'existing_loan_count': existing_loans,
            'residential_status': categorical['residential_status'],
            'number_of_dependents': dependents,
            'city_tier': categorical['city_tier'],
            'education_level': categorical['education_level'],
            'marital_status': categorical['marital_status'],
            'bank_account_vintage_months': bank_vintage
        })
        
        print("Calculating risk scores for all applications...")
        
        # Calculate risk scores and approval status
        risk_scores = []
        approval_statuses = []
        dti_ratios = []
        lti_ratios = []
        
        for idx, row in df.iterrows():
            if (idx + 1) % 500 == 0:
                print(f"  Processed {idx + 1}/{n_samples} applications...")
            
            features = row.to_dict()
            result = self.scorer.calculate_risk_score(features)
            
            risk_scores.append(result['risk_score'])
            approval_statuses.append(result['approval_status'])
            dti_ratios.append(result['derived_features']['dti_ratio'])
            lti_ratios.append(result['derived_features']['loan_to_income_ratio'])
        
        df['risk_score'] = risk_scores
        df['approval_status'] = approval_statuses
        df['dti_ratio'] = dti_ratios
        df['loan_to_income_ratio'] = lti_ratios
        
        print("\nDataset generation complete!")
        self._print_dataset_summary(df)
        
        return df
    
    def _print_dataset_summary(self, df: pd.DataFrame):
        """Print summary statistics of generated dataset"""
        print("\n" + "=" * 70)
        print("DATASET SUMMARY")
        print("=" * 70)
        
        print(f"\nTotal Samples: {len(df)}")
        
        print("\nApproval Distribution:")
        approval_counts = df['approval_status'].value_counts()
        for status, count in approval_counts.items():
            percentage = (count / len(df)) * 100
            print(f"  {status}: {count} ({percentage:.1f}%)")
        
        print("\nRisk Score Statistics:")
        print(f"  Mean: {df['risk_score'].mean():.2f}")
        print(f"  Median: {df['risk_score'].median():.2f}")
        print(f"  Std Dev: {df['risk_score'].std():.2f}")
        print(f"  Min: {df['risk_score'].min():.2f}")
        print(f"  Max: {df['risk_score'].max():.2f}")
        
        print("\nKey Feature Distributions:")
        print(f"  Credit Score - Mean: {df['credit_score'].mean():.0f}, Range: [{df['credit_score'].min()}, {df['credit_score'].max()}]")
        print(f"  Annual Income - Mean: ₹{df['annual_income'].mean():.0f}, Median: ₹{df['annual_income'].median():.0f}")
        print(f"  Loan Amount - Mean: ₹{df['loan_amount'].mean():.0f}, Median: ₹{df['loan_amount'].median():.0f}")
        print(f"  DTI Ratio - Mean: {df['dti_ratio'].mean():.1f}%, Median: {df['dti_ratio'].median():.1f}%")
        print(f"  LTI Ratio - Mean: {df['loan_to_income_ratio'].mean():.2f}, Median: {df['loan_to_income_ratio'].median():.2f}")
        
        print("\n" + "=" * 70)


def main():
    """Generate and save synthetic dataset"""
    generator = SyntheticDataGenerator(seed=42)
    
    # Generate dataset (default 5000 samples, can be adjusted)
    df = generator.generate_dataset(n_samples=5000)
    
    # Save to CSV
    output_file = 'ml/loan_applications_dataset.csv'
    df.to_csv(output_file, index=False)
    print(f"\n✓ Dataset saved to: {output_file}")
    
    # Display sample records
    print("\nSample Records (First 3):")
    print("=" * 70)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    print(df.head(3).to_string())
    
    return df


if __name__ == "__main__":
    main()
