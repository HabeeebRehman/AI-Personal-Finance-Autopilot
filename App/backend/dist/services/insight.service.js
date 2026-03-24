"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInsights = void 0;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../config");
/**
 * Generates a prompt for Gemini based on financial data.
 */
const generatePrompt = (data) => {
    const categoryStr = data.categories
        .map((c) => `- ${c.category}: ${c.total.toFixed(2)}`)
        .join('\n');
    return `You are a financial advisor. 
 
 Analyze the following financial data and generate a weekly financial report. 
 
 Include: 
 1. 3 key insights 
 2. 1 warning 
 3. 1 actionable recommendation 
 
 Keep it short, clear, and practical. 
 
 DATA: 
 Total Spend: ${data.totalSpent.toFixed(2)} 
 Category Breakdown: 
 ${categoryStr} 
 Forecast: Estimated spend of ${data.forecast.forecastSpend.toFixed(2)} for the remaining month. 
 Health Score: ${data.healthScore}/100 
 
 Return response in JSON format: 
 { 
   "insights": ["insight 1", "insight 2", "insight 3"], 
   "warning": "warning message", 
   "recommendation": "recommendation message" 
 } 
 `;
};
/**
 * Calls Gemini API to generate financial insights.
 */
const generateInsights = async (data) => {
    if (!config_1.config.geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }
    try {
        const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.geminiApiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        const prompt = generatePrompt(data);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        try {
            return JSON.parse(text);
        }
        catch (parseError) {
            console.error('Failed to parse Gemini response:', text);
            throw new Error('Invalid JSON response from Gemini');
        }
    }
    catch (error) {
        console.error('Gemini Insight Generation Error:', error);
        throw error;
    }
};
exports.generateInsights = generateInsights;
