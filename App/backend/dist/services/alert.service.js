"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAlert = void 0;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../config");
/**
 * Generate a smart alert using Gemini
 */
const generateAlert = async (data) => {
    if (!config_1.config.geminiApiKey) {
        throw new Error('Gemini API key is missing');
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `
    You are a financial assistant.

    Analyze the user's financial data and detect if they are overspending.

    Provide:
    1. A warning message
    2. A short reason
    3. A suggestion to reduce spending

    Keep it concise.

    DATA:
    Total Spent: ${data.totalSpent}
    Budget: ${data.budget}
    Category Breakdown: ${JSON.stringify(data.categoryBreakdown)}
    Forecast: ${data.forecast}

    Return JSON:
    {
      "warning": "",
      "reason": "",
      "suggestion": ""
    }
  `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        // Clean up potential markdown formatting in response
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    }
    catch (error) {
        console.error('Gemini Alert Generation Error:', error);
        // Return a fallback object if Gemini fails
        return {
            warning: 'Alert generation failed',
            reason: 'Could not connect to AI service',
            suggestion: 'Please try again later',
        };
    }
};
exports.generateAlert = generateAlert;
