import { GoogleGenerativeAI } from "@google/generative-ai";

const ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as any);
// Support both Vite (ENV) and Node/Other (process.env)
const API_KEY = ENV.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const API_URL = ENV.VITE_API_URL || '';

const genAI = new GoogleGenerativeAI(API_KEY);

async function urlToGenerativePart(url: string | undefined) {
    if (!url) return null;
    try {
        const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
        const response = await fetch(fullUrl);
        if (!response.ok) return null;
        const blob = await response.blob();
        return new Promise<any>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = (reader.result as string).split(',')[1];
                resolve({
                    inlineData: {
                        data: base64data,
                        mimeType: blob.type
                    }
                });
            };
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn("Could not load image for AI:", e);
        return null;
    }
}

export const aiService = {
    /**
     * Get repair diagnosis and parts estimation
     */
    async getRepairDiagnosis(device: string, issue: string): Promise<string> {
        if (!API_KEY) return "AI Diagnosis Unavailable: API Key Missing.";
        
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `You are a console repair expert. Analyze this ticket:
            Device: ${device}
            Issue: ${issue}
            
            Provide a technical diagnosis, common fix protocol, and estimated parts cost in INR. 
            Keep it concise and professional. Use markdown.`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Repair Error:", error);
            return "Failed to synchronize with AI Matrix.";
        }
    },

    /**
     * Get market value for buyback
     */
    async getMarketValue(device: string, condition: string): Promise<string> {
        if (!API_KEY) return "Market Intelligence Offline.";
        
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Analyze current market value for:
            Device: ${device}
            Condition: ${condition}
            
            Suggest a competitive buyback price range in INR and a recommended resale price. 
            Mention any specific market trends for this model.
            Keep it concise.`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Market Error:", error);
            return "Failed to fetch market data.";
        }
    },

    /**
     * Perform AI Risk Assessment for KYC
     */
    async getKYCRiskAssessment(data: any): Promise<string> {
        if (!API_KEY) return "Risk Matrix Offline.";

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `You are a strict Compliance & Security Officer. Analyze this KYC Dossier for potential risks.
            You are provided with images of the user's ID and selfie, along with the text details.
            Verify if the document looks authentic and if the face matches the ID.
            
            Text Details:
            Full Name: ${data.fullName}
            Address: ${data.address}
            Driving License: ${data.drivingLicenseNumber}
            Trust Score: ${data.trustScore}%
            Agent Findings: ${JSON.stringify(data.agentReports)}

            Provide a comprehensive multimodal risk assessment. Point out any visual anomalies in the documents.
            Rate the risk as LOW, MEDIUM, or HIGH.
            Keep it very concise and professional. Use markdown.`;

            const imageParts = [];
            if (data.idFrontUrl) {
                const part = await urlToGenerativePart(data.idFrontUrl);
                if (part) imageParts.push(part);
            }
            if (data.idBackUrl) {
                const part = await urlToGenerativePart(data.idBackUrl);
                if (part) imageParts.push(part);
            }
            if (data.selfieUrl) {
                const part = await urlToGenerativePart(data.selfieUrl);
                if (part) imageParts.push(part);
            }

            const result = await model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini KYC Error:", error);
            return "Failed to perform AI analysis. Fallback to manual heuristics recommended.";
        }
    }
};
