---
description: Setup and maintain the Machine Learning pipeline
---

# 🤖 Machine Learning Setup & Training Workflow

Follow these steps to initialize the ML models and ensure the prediction system is accurate.

## 1. Install Dependencies
// turbo
```bash
pip install -r requirements.txt
```

## 2. Generate Training Data
// turbo
Initialize the synthetic dataset (5,000 samples with banking-grade correlations):
```bash
npm run generate-data
```
Output: `ml/loan_applications_dataset.csv`

## 3. Train the Model
// turbo
Execute the training pipeline. This trains multiple models (Random Forest, Logistic Regression) and saves the best performer.
```bash
npm run train
```
Generated Artifacts:
- `ml/loan_approval_model.pkl` (Best Model)
- `ml/feature_scaler.pkl` (Preprocessing)
- `ml/model_metrics.json` (Performance Report)

## 4. Verify Accuracy
Check the `ml/model_metrics.json` file. The target accuracy is **85%+**.

## 5. Deployment
After training, restart the backend server to load the new model:
```bash
npm run backend
```

## 🎯 Verification Command
// turbo
```bash
python ml/test_system.py
```
