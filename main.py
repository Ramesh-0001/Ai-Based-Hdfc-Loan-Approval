import os
import json
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import services
from services.finance import FinanceService
from services.advisor import AdvisoryService
from services.workflow import WorkflowService
from services.documents import DocumentService
from services.support import SupportService
from services.dashboard import DashboardService

# Import ML logic
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml'))
from risk_scorer import RiskScorer

app = FastAPI(title="HDFC AI Loan Approval System API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_scorer = RiskScorer()

# --- Models ---
class RepaymentPlanRequest(BaseModel):
    amount: float
    rate: float
    tenure: int

class EMIComparisonRequest(BaseModel):
    amount: float
    rate: float
    tenure_options: List[int]

class EarlyClosureRequest(BaseModel):
    outstanding_balance: float
    remaining_tenure: int
    annual_rate: float
    current_emi: float

class SupportQueryRequest(BaseModel):
    query: str

class SmartSuggestionRequest(BaseModel):
    requested_amount: float
    annual_income: float
    ai_score: int

# --- Routes ---

@app.get("/")
async def root():
    return {"message": "HDFC AI Loan Approval System - Advanced Backend API"}

# 1. AI Loan Recommendation (Req 1)
@app.get("/api/advisor/recommendations")
async def get_recommendations(income: float, emp_type: str, credit_score: int):
    return AdvisoryService.get_loan_recommendation(income, emp_type, credit_score)

# 2. Loan Repayment Planner (Req 2)
@app.post("/api/finance/repayment-plan")
async def get_repayment_plan(data: RepaymentPlanRequest):
    return FinanceService.get_repayment_plan(data.amount, data.rate, data.tenure)

# 3. Application Timeline/Progress Tracker (Req 3 & 9)
@app.get("/api/workflow/status/{application_id}")
async def get_application_status(application_id: str, current_db_status: str = "PENDING"):
    stage_name = WorkflowService.map_db_status_to_workflow(current_db_status)
    status = WorkflowService.get_timeline_status(stage_name)
    status["application_id"] = application_id
    return status

# 4. Credit Score Improvement Tips (Req 4 & 12)
@app.get("/api/advisor/credit-tips")
async def get_credit_tips(score: int, dti: Optional[float] = None, tenure: Optional[float] = None):
    profile = {"dti_ratio": dti, "years_in_current_job": tenure} if dti or tenure else None
    return AdvisoryService.get_credit_improvement_tips(score, profile)

# 5. Loan Approval Probability (Req 5 - Logic inside RiskScorer)
@app.get("/api/risk/probability")
async def get_approval_probability(score: int):
    # Mapping based on Req 5
    if score >= 90: p = 95
    elif score >= 80: p = 85
    elif score >= 70: p = 70
    elif score >= 60: p = 55
    else: p = 30
    
    risk_level = "Low" if score >= 70 else ("Medium" if score >= 50 else "High")
    return {"percentage": p, "risk_level": risk_level}

# 6. EMI Comparison Tool (Req 6)
@app.post("/api/finance/compare-emi")
async def compare_emi(data: EMIComparisonRequest):
    return FinanceService.compare_emis(data.amount, data.rate, data.tenure_options)

# 7. AI Chat Assistant (Req 7)
@app.post("/api/support/chat")
async def chat_assistant(data: SupportQueryRequest):
    return SupportService.process_query(data.query)

# 8. Document Auto Verification (Req 8)
@app.post("/api/documents/verify")
async def verify_document(file: UploadFile = File(...), doc_type: str = Form(...)):
    # Simulating file reading
    content = await file.read()
    return DocumentService.validate_document(doc_type, file.filename, len(content))

# 10. Smart Loan Recommendation (Req 10)
@app.post("/api/advisor/smart-suggestion")
async def smart_loan_suggestion(data: SmartSuggestionRequest):
    return AdvisoryService.get_smart_loan_suggestion(data.requested_amount, data.annual_income, data.ai_score)

# 11. Early Loan Closure Calculator (Req 11)
@app.post("/api/finance/early-closure")
async def early_closure_calc(data: EarlyClosureRequest):
    return FinanceService.calculate_early_closure(data.outstanding_balance, data.remaining_tenure, data.annual_rate, data.current_emi)

# 13. Financial Health Dashboard (Req 13)
@app.get("/api/dashboard/health")
async def financial_health(income: float, credit_score: int, existing_emis: float, requested_loan: float):
    return DashboardService.get_financial_health_metrics(income, credit_score, existing_emis, requested_loan)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
