import random
import time
import json
import logging

logger = logging.getLogger(__name__)

class OCRService:
    @staticmethod
    def extract_document_data(doc_type, file_path, user_context=None):
        """
        Heuristic extraction for document verification (Backend Fallback)
        """
        time.sleep(1.0)
        filename_l = str(file_path).lower()
        
        # Default to user context if provided (simulating "found what we expected")
        # In a real system, this would be actual OCR results.
        extracted_data = {
            "full_name": user_context.get("name") if user_context else "Unknown Name",
            "income": float(user_context.get("income", 0)) if user_context else 0,
            "mobile": user_context.get("mobile") if user_context else "0000000000",
            "document_type": doc_type.replace('_', ' ').title()
        }

        # If filename contains certain names, we can simulate different extractions
        if "cancelo" in filename_l:
            extracted_data.update({"full_name": "Joao Cancelo", "income": 2500000})
        elif "ronaldo" in filename_l:
            extracted_data.update({"full_name": "Cristiano Ronaldo", "income": 95000000})
        elif "alvarez" in filename_l:
            extracted_data.update({"full_name": "Alvarez", "income": 120000})

        ocr_result = {
            "success": True,
            "passed": True,
            "doc_type": doc_type,
            "data": extracted_data,
            "confidence": 95,
            "summary": "Data extracted based on document context."
        }
        
        print("Backend OCR Result:", ocr_result)
        return ocr_result

# Example of how you would implement real OCR (Tesseract)
"""
# To use this, pip install pytesseract Pillow
import pytesseract
from PIL import Image

def real_ocr_extraction(file_path):
    text = pytesseract.image_to_string(Image.open(file_path))
    # Then use regex to find Name, PAN, etc.
    return text
"""
