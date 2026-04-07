import { API_BASE_URL } from '../src/config/api';

export class GeminiService {
    constructor() {
        this.apiBaseUrl = API_BASE_URL;
    }

    async predictLoanEligibility(application) {
        console.log("Calling Simple ML API for application:", application);

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/predict-loan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(application)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("ML API Response:", result);

            return {
                status: result.status,
                creditworthiness_score: result.risk_score || result.creditworthiness_score,
                risk_level: result.risk_level,
                risk_category: result.risk_category,
                score_breakdown: result.score_breakdown,
                fraud_detection: result.fraud_detection,
                reasoning: result.reasoning,
                ml_insight: result.ml_insight,
                recommendations: result.recommendations,
                comparison: result.comparison
            };
        } catch (error) {
            console.error("ML API Connection Error:", error);
            return {
                status: 'REJECTED',
                creditworthiness_score: 0,
                reasoning: ["Institutional AI Server Connection Issue. Please ensure 'api_server.py' is running."]
            };
        }
    }
}

export const geminiService = new GeminiService();
