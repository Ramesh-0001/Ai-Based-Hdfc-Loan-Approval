from typing import Dict, List, Any

class WorkflowService:
    STAGES = [
        {"id": 1, "name": "Application Submitted", "progress": 10},
        {"id": 2, "name": "Document Verification", "progress": 30},
        {"id": 3, "name": "Fraud Check", "progress": 50},
        {"id": 4, "name": "AI Risk Scoring", "progress": 70},
        {"id": 5, "name": "Bank Officer Review", "progress": 90},
        {"id": 6, "name": "Loan Approved / Rejected", "progress": 100}
    ]

    @classmethod
    def get_timeline_status(cls, current_stage_name: str) -> Dict[str, Any]:
        """Requirement 3 & 9: Application Progress Tracker"""
        current_stage = next((s for s in cls.STAGES if s["name"] == current_stage_name), cls.STAGES[0])
        
        return {
            "application_id": None, # Set by controller
            "stage": current_stage["name"],
            "progress": current_stage["progress"],
            "all_stages": cls.STAGES,
            "is_completed": current_stage["progress"] == 100
        }

    @staticmethod
    def map_db_status_to_workflow(db_status: str) -> str:
        """Utility to map technical status to UI stage names"""
        mapping = {
            "PENDING": "Application Submitted",
            "DOC_UPL": "Document Verification",
            "FRAUD_CHK": "Fraud Check",
            "AI_SCORE": "AI Risk Scoring",
            "REVIEW": "Bank Officer Review",
            "APPROVED": "Loan Approved / Rejected",
            "REJECTED": "Loan Approved / Rejected"
        }
        return mapping.get(db_status, "Application Submitted")
