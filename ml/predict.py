"""
Loan Approval Prediction API
Uses trained ML model to predict loan approval
"""

import pickle
import pandas as pd
import numpy as np
from typing import Dict, Any


class LoanApprovalPredictor:
    """Predict loan approval using trained ML model"""
    
    def __init__(self):
        """Load trained model and preprocessing artifacts"""
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.feature_columns = None
        self.load_artifacts()
    
    def load_artifacts(self):
        """Load all saved artifacts"""
        try:
            with open('ml/loan_approval_model.pkl', 'rb') as f:
                self.model = pickle.load(f)
            
            with open('ml/feature_scaler.pkl', 'rb') as f:
                self.scaler = pickle.load(f)
            
            with open('ml/label_encoder.pkl', 'rb') as f:
                self.label_encoder = pickle.load(f)
            
            with open('ml/feature_columns.pkl', 'rb') as f:
                self.feature_columns = pickle.load(f)
            
            print("[OK] Model artifacts loaded successfully")
        except Exception as e:
            print(f"Error loading artifacts: {e}")
            raise
    
    def preprocess_input(self, applicant_data: Dict[str, Any]) -> pd.DataFrame:
        """Preprocess input data for prediction"""
        # Create DataFrame
        df = pd.DataFrame([applicant_data])
        
        # One-hot encode categorical features
        categorical_columns = [
            'employment_type', 'loan_purpose', 'residential_status',
            'city_tier', 'education_level', 'marital_status'
        ]
        
        df_encoded = pd.get_dummies(df, columns=categorical_columns, drop_first=True)
        
        # Ensure all required columns are present
        for col in self.feature_columns:
            if col not in df_encoded.columns:
                df_encoded[col] = 0
        
        # Select only the columns used during training
        df_encoded = df_encoded[self.feature_columns]
        
        return df_encoded
    
    def predict(self, applicant_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict loan approval for an applicant
        
        Args:
            applicant_data: Dictionary with applicant features
        
        Returns:
            Dictionary with prediction, probability, and confidence
        """
        # Preprocess input
        X = self.preprocess_input(applicant_data)
        
        # Make prediction
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        # Decode prediction
        predicted_status = self.label_encoder.inverse_transform([prediction])[0]
        
        # Get confidence (probability of predicted class)
        confidence = probabilities[prediction]
        
        # Get probabilities for all classes
        class_probabilities = {
            class_name: float(prob)
            for class_name, prob in zip(self.label_encoder.classes_, probabilities)
        }
        
        return {
            'prediction': predicted_status,
            'confidence': float(confidence),
            'probabilities': class_probabilities,
            'recommendation': self._get_recommendation(predicted_status, confidence)
        }
    
    def _get_recommendation(self, status: str, confidence: float) -> str:
        """Generate recommendation based on prediction"""
        if status == 'APPROVED' and confidence > 0.8:
            return "Strong candidate for approval"
        elif status == 'APPROVED':
            return "Likely to be approved, but review recommended"
        elif status == 'MANUAL_REVIEW':
            return "Borderline case - manual review required"
        elif status == 'REJECTED' and confidence > 0.8:
            return "High risk - not recommended for approval"
        else:
            return "Likely to be rejected - consider improvements"


def demo_prediction():
    """Demonstrate model prediction"""
    predictor = LoanApprovalPredictor()
    
    print("\n" + "="*70)
    print("LOAN APPROVAL ML MODEL - PREDICTION DEMO")
    print("="*70)
    
    # Test case 1: Strong applicant
    strong_applicant = {
        'age': 35,
        'annual_income': 1200000,
        'credit_score': 780,
        'employment_type': 'Government',
        'loan_amount': 2000000,
        'monthly_existing_emis': 15000,
        'loan_purpose': 'Home',
        'loan_tenure_months': 240,
        'years_in_current_job': 8,
        'total_work_experience': 12,
        'existing_loan_count': 1,
        'residential_status': 'Owned',
        'number_of_dependents': 2,
        'city_tier': 'Metro',
        'education_level': 'Post-Graduate',
        'marital_status': 'Married',
        'bank_account_vintage_months': 96
    }
    
    print("\n1. STRONG APPLICANT")
    print("-"*70)
    result1 = predictor.predict(strong_applicant)
    print(f"Prediction: {result1['prediction']}")
    print(f"Confidence: {result1['confidence']:.2%}")
    print(f"Recommendation: {result1['recommendation']}")
    print("\nClass Probabilities:")
    for class_name, prob in result1['probabilities'].items():
        print(f"  {class_name}: {prob:.2%}")
    
    # Test case 2: Weak applicant
    weak_applicant = {
        'age': 28,
        'annual_income': 400000,
        'credit_score': 620,
        'employment_type': 'Freelancer',
        'loan_amount': 1500000,
        'monthly_existing_emis': 12000,
        'loan_purpose': 'Personal',
        'loan_tenure_months': 60,
        'years_in_current_job': 0.5,
        'total_work_experience': 3,
        'existing_loan_count': 3,
        'residential_status': 'Rented',
        'number_of_dependents': 1,
        'city_tier': 'Tier-2',
        'education_level': 'Graduate',
        'marital_status': 'Single',
        'bank_account_vintage_months': 18
    }
    
    print("\n\n2. WEAK APPLICANT")
    print("-"*70)
    result2 = predictor.predict(weak_applicant)
    print(f"Prediction: {result2['prediction']}")
    print(f"Confidence: {result2['confidence']:.2%}")
    print(f"Recommendation: {result2['recommendation']}")
    print("\nClass Probabilities:")
    for class_name, prob in result2['probabilities'].items():
        print(f"  {class_name}: {prob:.2%}")
    
    print("\n" + "="*70)
    print("[OK] Model predictions completed successfully")
    print("="*70 + "\n")


if __name__ == "__main__":
    demo_prediction()
