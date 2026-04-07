from typing import Dict, List, Any

class SupportService:
    FAQ = {
        "eligibility": "To be eligible for a loan, you typically need a monthly income of ₹25,000+ and a credit score above 650.",
        "documents": "Required documents include PAN Card, Aadhaar Card, 3 months' salary slips, and 6 months' bank statements.",
        "interest": "Interest rates vary by product: Personal loans start at 10.5%, Home loans at 8.4%, and Business loans at 13%.",
        "status": "You can track your application status in real-time using the 'Application Tracker' in your dashboard.",
        "emi": "You can use our Loan Repayment Planner tool on the dashboard to calculate your monthly EMI and total interest."
    }

    @classmethod
    def process_query(cls, query: str) -> Dict[str, Any]:
        """Requirement 7: AI Chat Assistant (Rule-based)"""
        query_lower = query.lower()
        response = "I'm sorry, I couldn't find specific information on that. Would you like to speak with a bank representative?"
        intent = "unknown"

        for key in cls.FAQ:
            if key in query_lower:
                response = cls.FAQ[key]
                intent = key
                break
        
        # Keyword matching for broader coverage
        if "hello" in query_lower or "hi" in query_lower:
            response = "Hello! I am your HDFC AI Assistant. How can I help you with your loan application today?"
            intent = "greeting"
        elif "help" in query_lower:
            response = "I can help with eligibility, documents, interest rates, and application status. What would you like to know?"
            intent = "help"

        return {
            "query": query,
            "response": response,
            "intent": intent,
            "suggestions": ["Loan eligibility", "Required documents", "Interest rate details"]
        }
