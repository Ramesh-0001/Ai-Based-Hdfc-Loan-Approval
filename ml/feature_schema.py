"""
Feature Schema for Loan Approval System
Defines all features, data types, validation rules, and feature engineering logic
"""

from typing import Dict, Any, List
from enum import Enum
from dataclasses import dataclass, field


class EmploymentType(Enum):
    """Employment type categories"""
    GOVERNMENT = "Government"
    SALARIED = "Salaried"
    SELF_EMPLOYED = "Self-Employed"
    FREELANCER = "Freelancer"


class LoanPurpose(Enum):
    """Loan purpose categories"""
    HOME = "Home"
    EDUCATION = "Education"
    PERSONAL = "Personal"
    BUSINESS = "Business"
    MEDICAL = "Medical"
    VEHICLE = "Vehicle"


class ResidentialStatus(Enum):
    """Residential status categories"""
    OWNED = "Owned"
    RENTED = "Rented"
    FAMILY_OWNED = "Family-Owned"
    COMPANY_PROVIDED = "Company-Provided"


class CityTier(Enum):
    """City tier classification"""
    METRO = "Metro"
    TIER1 = "Tier-1"
    TIER2 = "Tier-2"
    TIER3 = "Tier-3"


class EducationLevel(Enum):
    """Education level categories"""
    HIGH_SCHOOL = "High-School"
    GRADUATE = "Graduate"
    POST_GRADUATE = "Post-Graduate"
    PROFESSIONAL = "Professional"


class MaritalStatus(Enum):
    """Marital status categories"""
    SINGLE = "Single"
    MARRIED = "Married"
    DIVORCED = "Divorced"
    WIDOWED = "Widowed"


@dataclass
class FeatureValidation:
    """Validation rules for a feature"""
    min_value: float = None
    max_value: float = None
    allowed_values: List[str] = field(default_factory=list)
    required: bool = True
    
    def validate(self, value: Any) -> bool:
        """Validate a feature value"""
        if self.required and value is None:
            return False
        
        if self.min_value is not None and value < self.min_value:
            return False
        
        if self.max_value is not None and value > self.max_value:
            return False
        
        if self.allowed_values and value not in self.allowed_values:
            return False
        
        return True


# Feature Schema Definition
FEATURE_SCHEMA = {
    # ==================== CORE FEATURES (Enhanced) ====================
    "age": {
        "type": "int",
        "description": "Applicant's age in years",
        "validation": FeatureValidation(min_value=21, max_value=70),
        "category": "personal"
    },
    
    "annual_income": {
        "type": "float",
        "description": "Annual income in INR",
        "validation": FeatureValidation(min_value=300000, max_value=50000000),
        "category": "financial"
    },
    
    "credit_score": {
        "type": "int",
        "description": "Credit score (300-850)",
        "validation": FeatureValidation(min_value=300, max_value=850),
        "category": "financial"
    },
    
    "employment_type": {
        "type": "categorical",
        "description": "Type of employment",
        "validation": FeatureValidation(
            allowed_values=[e.value for e in EmploymentType]
        ),
        "category": "employment"
    },
    
    "loan_amount": {
        "type": "float",
        "description": "Requested loan amount in INR",
        "validation": FeatureValidation(min_value=50000, max_value=10000000),
        "category": "loan"
    },
    
    "monthly_existing_emis": {
        "type": "float",
        "description": "Total monthly EMI payments for existing loans",
        "validation": FeatureValidation(min_value=0, max_value=200000),
        "category": "financial"
    },
    
    "loan_purpose": {
        "type": "categorical",
        "description": "Purpose of the loan",
        "validation": FeatureValidation(
            allowed_values=[p.value for p in LoanPurpose]
        ),
        "category": "loan"
    },
    
    # ==================== NEW CRITICAL FEATURES ====================
    "loan_tenure_months": {
        "type": "int",
        "description": "Loan tenure in months",
        "validation": FeatureValidation(min_value=6, max_value=360),
        "category": "loan"
    },
    
    "years_in_current_job": {
        "type": "float",
        "description": "Years in current job/business",
        "validation": FeatureValidation(min_value=0, max_value=40),
        "category": "employment"
    },
    
    "total_work_experience": {
        "type": "float",
        "description": "Total work experience in years",
        "validation": FeatureValidation(min_value=0, max_value=45),
        "category": "employment"
    },
    
    "existing_loan_count": {
        "type": "int",
        "description": "Number of existing active loans",
        "validation": FeatureValidation(min_value=0, max_value=10),
        "category": "financial"
    },
    
    "residential_status": {
        "type": "categorical",
        "description": "Residential ownership status",
        "validation": FeatureValidation(
            allowed_values=[r.value for r in ResidentialStatus]
        ),
        "category": "personal"
    },
    
    "number_of_dependents": {
        "type": "int",
        "description": "Number of financial dependents",
        "validation": FeatureValidation(min_value=0, max_value=10),
        "category": "personal"
    },
    
    "city_tier": {
        "type": "categorical",
        "description": "City tier classification",
        "validation": FeatureValidation(
            allowed_values=[c.value for c in CityTier]
        ),
        "category": "personal"
    },
    
    "education_level": {
        "type": "categorical",
        "description": "Highest education level",
        "validation": FeatureValidation(
            allowed_values=[e.value for e in EducationLevel]
        ),
        "category": "personal"
    },
    
    "marital_status": {
        "type": "categorical",
        "description": "Marital status",
        "validation": FeatureValidation(
            allowed_values=[m.value for m in MaritalStatus]
        ),
        "category": "personal"
    },
    
    "bank_account_vintage_months": {
        "type": "int",
        "description": "Months since bank account opened",
        "validation": FeatureValidation(min_value=0, max_value=600),
        "category": "financial"
    },
}


class FeatureEngineer:
    """Feature engineering and derived feature calculations"""
    
    @staticmethod
    def calculate_monthly_income(annual_income: float) -> float:
        """Calculate monthly income from annual income"""
        return annual_income / 12
    
    @staticmethod
    def calculate_proposed_emi(loan_amount: float, tenure_months: int, 
                               interest_rate: float = 10.5) -> float:
        """
        Calculate EMI using standard formula
        EMI = [P × r × (1+r)^n] / [(1+r)^n - 1]
        where P = loan amount, r = monthly interest rate, n = tenure
        """
        monthly_rate = interest_rate / (12 * 100)
        emi = (loan_amount * monthly_rate * 
               (1 + monthly_rate) ** tenure_months) / \
              ((1 + monthly_rate) ** tenure_months - 1)
        return round(emi, 2)
    
    @staticmethod
    def calculate_dti_ratio(monthly_existing_emis: float, 
                           proposed_emi: float, 
                           monthly_income: float) -> float:
        """
        Calculate Debt-to-Income ratio
        DTI = (Total Monthly EMIs / Monthly Income) × 100
        """
        total_emis = monthly_existing_emis + proposed_emi
        dti = (total_emis / monthly_income) * 100
        return round(dti, 2)
    
    @staticmethod
    def calculate_loan_to_income_ratio(loan_amount: float, 
                                       annual_income: float) -> float:
        """
        Calculate Loan-to-Income ratio
        LTI = Loan Amount / Annual Income
        """
        lti = loan_amount / annual_income
        return round(lti, 2)
    
    @staticmethod
    def calculate_income_per_dependent(annual_income: float, 
                                       dependents: int) -> float:
        """
        Calculate income per dependent
        Effective Income = Annual Income / (Dependents + 1)
        """
        income_per_dependent = annual_income / (dependents + 1)
        return round(income_per_dependent, 2)
    
    @staticmethod
    def calculate_emi_burden(monthly_existing_emis: float, 
                            monthly_income: float) -> float:
        """
        Calculate existing EMI burden percentage
        EMI Burden = (Existing EMIs / Monthly Income) × 100
        """
        burden = (monthly_existing_emis / monthly_income) * 100
        return round(burden, 2)
    
    @staticmethod
    def calculate_employment_stability_score(employment_type: str, 
                                            years_in_job: float,
                                            total_experience: float) -> float:
        """
        Calculate employment stability score (0-10)
        Based on employment type, job tenure, and total experience
        """
        # Base score by employment type
        type_scores = {
            "Government": 10,
            "Salaried": 8,
            "Self-Employed": 6,
            "Freelancer": 4
        }
        base_score = type_scores.get(employment_type, 5)
        
        # Tenure multiplier
        if years_in_job >= 5:
            tenure_multiplier = 1.0
        elif years_in_job >= 2:
            tenure_multiplier = 0.9
        elif years_in_job >= 1:
            tenure_multiplier = 0.7
        else:
            tenure_multiplier = 0.5
        
        # Experience bonus
        experience_bonus = min(total_experience / 10, 1.0) * 2
        
        stability_score = (base_score * tenure_multiplier) + experience_bonus
        return round(min(stability_score, 10), 2)
    
    @staticmethod
    def get_all_derived_features(features: Dict[str, Any]) -> Dict[str, float]:
        """Calculate all derived features from input features"""
        engineer = FeatureEngineer()
        
        monthly_income = engineer.calculate_monthly_income(
            features['annual_income']
        )
        
        proposed_emi = engineer.calculate_proposed_emi(
            features['loan_amount'],
            features['loan_tenure_months']
        )
        
        derived = {
            'monthly_income': monthly_income,
            'proposed_emi': proposed_emi,
            'dti_ratio': engineer.calculate_dti_ratio(
                features['monthly_existing_emis'],
                proposed_emi,
                monthly_income
            ),
            'loan_to_income_ratio': engineer.calculate_loan_to_income_ratio(
                features['loan_amount'],
                features['annual_income']
            ),
            'income_per_dependent': engineer.calculate_income_per_dependent(
                features['annual_income'],
                features['number_of_dependents']
            ),
            'emi_burden': engineer.calculate_emi_burden(
                features['monthly_existing_emis'],
                monthly_income
            ),
            'employment_stability_score': engineer.calculate_employment_stability_score(
                features['employment_type'],
                features['years_in_current_job'],
                features['total_work_experience']
            )
        }
        
        return derived


def validate_features(features: Dict[str, Any]) -> tuple[bool, List[str]]:
    """
    Validate all features against schema
    Returns (is_valid, error_messages)
    """
    errors = []
    
    for feature_name, feature_config in FEATURE_SCHEMA.items():
        if feature_name not in features:
            if feature_config['validation'].required:
                errors.append(f"Missing required feature: {feature_name}")
            continue
        
        value = features[feature_name]
        if not feature_config['validation'].validate(value):
            errors.append(
                f"Invalid value for {feature_name}: {value}"
            )
    
    return len(errors) == 0, errors


def get_feature_summary() -> Dict[str, int]:
    """Get summary of feature schema"""
    categories = {}
    for feature_config in FEATURE_SCHEMA.values():
        category = feature_config['category']
        categories[category] = categories.get(category, 0) + 1
    
    return {
        'total_features': len(FEATURE_SCHEMA),
        'by_category': categories
    }


if __name__ == "__main__":
    # Print feature schema summary
    summary = get_feature_summary()
    print("=" * 60)
    print("LOAN APPROVAL FEATURE SCHEMA")
    print("=" * 60)
    print(f"\nTotal Features: {summary['total_features']}")
    print("\nFeatures by Category:")
    for category, count in summary['by_category'].items():
        print(f"  - {category.capitalize()}: {count}")
    
    print("\n" + "=" * 60)
    print("FEATURE DETAILS")
    print("=" * 60)
    
    for name, config in FEATURE_SCHEMA.items():
        print(f"\n{name}:")
        print(f"  Type: {config['type']}")
        print(f"  Description: {config['description']}")
        print(f"  Category: {config['category']}")
