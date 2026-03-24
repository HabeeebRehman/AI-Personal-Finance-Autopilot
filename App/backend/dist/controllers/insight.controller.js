"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyInsights = void 0;
const analyticsService = __importStar(require("../services/analytics.service"));
const insightService = __importStar(require("../services/insight.service"));
/**
 * Controller to fetch weekly AI-powered insights.
 */
const getWeeklyInsights = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        // 1. Fetch all required analytics data
        const categories = await analyticsService.getCategoryAnalytics(userId);
        const forecast = await analyticsService.getForecast(userId);
        const health = await analyticsService.getFinancialHealth(userId);
        // 2. Calculate total spending for the month
        const totalSpent = categories.reduce((sum, item) => sum + item.total, 0);
        // 3. Prepare data for Gemini
        const insightData = {
            totalSpent,
            categories,
            forecast: {
                forecastSpend: forecast.forecastSpend,
            },
            healthScore: health.healthScore,
        };
        // 4. Generate AI insights
        const aiResponse = await insightService.generateInsights(insightData);
        // 5. Return structured response
        return res.status(200).json({
            success: true,
            data: aiResponse,
        });
    }
    catch (error) {
        console.error('Error generating insights:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate financial insights. Please try again later.',
            error: error.message,
        });
    }
};
exports.getWeeklyInsights = getWeeklyInsights;
