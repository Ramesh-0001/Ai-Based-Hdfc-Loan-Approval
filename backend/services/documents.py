import re
from typing import Dict, List, Any

class DocumentService:
    @staticmethod
    def validate_document(doc_type: str, filename: str, content_size: int = 0) -> Dict[str, Any]:
        """Requirement 8: Document Auto Verification"""
        
        # 1. Format Validation
        allowed_extensions = ('.pdf', '.jpg', '.jpeg', '.png')
        is_format_valid = filename.lower().endswith(allowed_extensions)
        
        # 2. Field check simulation (in real world OCR would be here)
        status = "Verified"
        reason = "Format and metadata validated successfully."
        is_suspicious = False
        
        if not is_format_valid:
            status = "Rejected"
            reason = f"Invalid file format. Allowed: {', '.join(allowed_extensions)}"
        elif content_size > 5 * 1024 * 1024: # 5MB limit
            status = "Pending"
            reason = "File size too large. Manual review required."
        elif re.search(r'test|dummy|fake', filename.lower()):
            status = "Risk Flag"
            reason = "Suspicious filename detected."
            is_suspicious = True
            
        return {
            "document_type": doc_type,
            "filename": filename,
            "status": status,
            "reason": reason,
            "is_suspicious": is_suspicious,
            "missing_fields": [] # Would be populated by OCR
        }

    @classmethod
    def verify_application_documents(cls, docs: List[Dict[str, Any]]) -> Dict[str, Any]:
        results = []
        all_verified = True
        
        required_docs = ["PAN", "Aadhaar", "Salary Slip", "Bank Statement"]
        received_docs = [d['type'] for d in docs]
        missing_mandatory = [rd for rd in required_docs if rd not in received_docs]
        
        for doc in docs:
            verification = cls.validate_document(doc['type'], doc['filename'])
            results.append(verification)
            if verification['status'] != "Verified":
                all_verified = False
                
        return {
            "verifications": results,
            "all_verified": all_verified and not missing_mandatory,
            "missing_mandatory": missing_mandatory,
            "overall_status": "Complete" if all_verified and not missing_mandatory else "Pending"
        }
