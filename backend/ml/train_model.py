"""
ML Model Training Pipeline for Loan Approval System
Trains multiple models and evaluates performance
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score
)
import pickle
import json
from datetime import datetime


class LoanApprovalMLPipeline:
    """Complete ML pipeline for loan approval prediction"""
    
    def __init__(self, dataset_path='ml/loan_applications_dataset.csv'):
        self.dataset_path = dataset_path
        self.models = {}
        self.scaler = None
        self.label_encoder = None
        self.feature_columns = None
        self.categorical_columns = []
        self.numerical_columns = []
        
    def load_data(self):
        """Load and prepare dataset"""
        print("Loading dataset...")
        df = pd.read_csv(self.dataset_path)
        print(f"✓ Loaded {len(df)} samples")
        return df
    
    def prepare_features(self, df):
        """Prepare features for training"""
        print("\nPreparing features...")
        
        # Define feature columns (exclude target and derived features used for risk scoring)
        exclude_cols = ['risk_score', 'approval_status', 'dti_ratio', 'loan_to_income_ratio']
        self.feature_columns = [col for col in df.columns if col not in exclude_cols]
        
        # Identify categorical and numerical columns
        self.categorical_columns = [
            'employment_type', 'loan_purpose', 'residential_status',
            'city_tier', 'education_level', 'marital_status'
        ]
        
        self.numerical_columns = [
            col for col in self.feature_columns 
            if col not in self.categorical_columns
        ]
        
        print(f"✓ {len(self.feature_columns)} features")
        print(f"  - {len(self.categorical_columns)} categorical")
        print(f"  - {len(self.numerical_columns)} numerical")
        
        return df
    
    def encode_features(self, df):
        """Encode categorical features"""
        print("\nEncoding categorical features...")
        
        df_encoded = df.copy()
        
        # One-hot encode categorical features
        df_encoded = pd.get_dummies(
            df_encoded, 
            columns=self.categorical_columns,
            drop_first=True  # Avoid multicollinearity
        )
        
        # Update feature columns after encoding
        self.feature_columns = [
            col for col in df_encoded.columns 
            if col not in ['risk_score', 'approval_status', 'dti_ratio', 'loan_to_income_ratio']
        ]
        
        print(f"✓ Encoded to {len(self.feature_columns)} features")
        
        return df_encoded
    
    def split_data(self, df):
        """Split data into train and test sets"""
        print("\nSplitting data...")
        
        X = df[self.feature_columns]
        y = df['approval_status']
        
        # Encode target variable
        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Split: 80% train, 20% test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, 
            test_size=0.2, 
            random_state=42,
            stratify=y_encoded  # Maintain class distribution
        )
        
        print(f"✓ Train: {len(X_train)} samples")
        print(f"✓ Test:  {len(X_test)} samples")
        
        # Scale numerical features
        self.scaler = StandardScaler()
        X_train_scaled = X_train.copy()
        X_test_scaled = X_test.copy()
        
        # Only scale numerical columns
        numerical_indices = [i for i, col in enumerate(X_train.columns) 
                           if any(num_col in col for num_col in self.numerical_columns)]
        
        if numerical_indices:
            X_train_scaled.iloc[:, numerical_indices] = self.scaler.fit_transform(
                X_train.iloc[:, numerical_indices]
            )
            X_test_scaled.iloc[:, numerical_indices] = self.scaler.transform(
                X_test.iloc[:, numerical_indices]
            )
        
        return X_train_scaled, X_test_scaled, y_train, y_test
    
    def train_logistic_regression(self, X_train, y_train):
        """Train Logistic Regression model"""
        print("\n" + "="*60)
        print("Training Logistic Regression...")
        print("="*60)
        
        model = LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced'  # Handle class imbalance
        )
        
        model.fit(X_train, y_train)
        self.models['logistic_regression'] = model
        
        print("✓ Logistic Regression trained")
        return model
    
    def train_random_forest(self, X_train, y_train):
        """Train Random Forest model"""
        print("\n" + "="*60)
        print("Training Random Forest...")
        print("="*60)
        
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            class_weight='balanced',
            n_jobs=-1  # Use all CPU cores
        )
        
        model.fit(X_train, y_train)
        self.models['random_forest'] = model
        
        print("✓ Random Forest trained")
        return model
    
    def evaluate_model(self, model, X_test, y_test, model_name):
        """Evaluate model performance"""
        print(f"\nEvaluating {model_name}...")
        
        # Predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)
        
        # Metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        # Multi-class ROC AUC
        try:
            roc_auc = roc_auc_score(y_test, y_pred_proba, multi_class='ovr', average='weighted')
        except:
            roc_auc = 0.0
        
        print(f"\n{'Metric':<20} {'Score':<10}")
        print("-" * 30)
        print(f"{'Accuracy':<20} {accuracy:.4f}")
        print(f"{'Precision':<20} {precision:.4f}")
        print(f"{'Recall':<20} {recall:.4f}")
        print(f"{'F1-Score':<20} {f1:.4f}")
        print(f"{'ROC-AUC':<20} {roc_auc:.4f}")
        
        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        print(f"\nConfusion Matrix:")
        print(cm)
        
        # Classification Report
        print(f"\nClassification Report:")
        class_names = self.label_encoder.classes_
        print(classification_report(y_test, y_pred, target_names=class_names, zero_division=0))
        
        return {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'roc_auc': float(roc_auc),
            'confusion_matrix': cm.tolist()
        }
    
    def save_models(self, metrics):
        """Save trained models and metrics"""
        print("\n" + "="*60)
        print("Saving models...")
        print("="*60)
        
        # Save best model (Random Forest typically performs best)
        best_model_name = max(metrics.keys(), key=lambda k: metrics[k]['accuracy'])
        best_model = self.models[best_model_name]
        
        with open('ml/loan_approval_model.pkl', 'wb') as f:
            pickle.dump(best_model, f)
        print(f"✓ Saved best model: {best_model_name}")
        
        # Save scaler
        with open('ml/feature_scaler.pkl', 'wb') as f:
            pickle.dump(self.scaler, f)
        print("✓ Saved feature scaler")
        
        # Save label encoder
        with open('ml/label_encoder.pkl', 'wb') as f:
            pickle.dump(self.label_encoder, f)
        print("✓ Saved label encoder")
        
        # Save feature columns
        with open('ml/feature_columns.pkl', 'wb') as f:
            pickle.dump(self.feature_columns, f)
        print("✓ Saved feature columns")
        
        # Save metrics
        metrics_with_metadata = {
            'timestamp': datetime.now().isoformat(),
            'best_model': best_model_name,
            'models': metrics,
            'dataset_size': len(pd.read_csv(self.dataset_path)),
            'feature_count': len(self.feature_columns)
        }
        
        with open('ml/model_metrics.json', 'w') as f:
            json.dump(metrics_with_metadata, f, indent=2)
        print("✓ Saved metrics")
    
    def run_pipeline(self):
        """Run complete training pipeline"""
        print("\n" + "█"*60)
        print("  LOAN APPROVAL ML TRAINING PIPELINE")
        print("█"*60)
        
        # Load data
        df = self.load_data()
        
        # Prepare features
        df = self.prepare_features(df)
        
        # Encode features
        df_encoded = self.encode_features(df)
        
        # Split data
        X_train, X_test, y_train, y_test = self.split_data(df_encoded)
        
        # Train models
        self.train_logistic_regression(X_train, y_train)
        self.train_random_forest(X_train, y_train)
        
        # Evaluate models
        metrics = {}
        for model_name, model in self.models.items():
            metrics[model_name] = self.evaluate_model(
                model, X_test, y_test, model_name
            )
        
        # Save models
        self.save_models(metrics)
        
        # Summary
        print("\n" + "█"*60)
        print("  TRAINING COMPLETE")
        print("█"*60)
        print("\nModel Performance Summary:")
        print(f"{'Model':<25} {'Accuracy':<12} {'F1-Score':<12}")
        print("-" * 50)
        for model_name, model_metrics in metrics.items():
            print(f"{model_name:<25} {model_metrics['accuracy']:<12.4f} {model_metrics['f1_score']:<12.4f}")
        
        best_model = max(metrics.keys(), key=lambda k: metrics[k]['accuracy'])
        print(f"\n🏆 Best Model: {best_model}")
        print(f"   Accuracy: {metrics[best_model]['accuracy']:.4f}")
        print("█"*60 + "\n")


def main():
    """Run the training pipeline"""
    pipeline = LoanApprovalMLPipeline()
    pipeline.run_pipeline()


if __name__ == "__main__":
    main()
