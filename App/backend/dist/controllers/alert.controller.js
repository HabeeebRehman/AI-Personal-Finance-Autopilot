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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlert = void 0;
const alertService = __importStar(require("../services/alert.service"));
const budgetService = __importStar(require("../services/budget.service"));
const analyticsService = __importStar(require("../services/analytics.service"));
const prisma_1 = __importDefault(require("../prisma"));
/**
 * Get overspending alert
 */
const getAlert = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user ID missing from request',
            });
        }
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        // 1. Fetch budget
        const budget = await budgetService.getBudget(userId, month, year);
        if (!budget || budget.amount <= 0) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No budget set for the current month',
            });
        }
        // 2. Fetch total expenses for current month
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        const expenses = await prisma_1.default.expense.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
        });
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        // 3. Fetch category breakdown
        const categoryAnalytics = await analyticsService.getCategoryAnalytics(userId);
        const categoryBreakdown = {};
        categoryAnalytics.forEach((item) => {
            categoryBreakdown[item.category] = item.total;
        });
        // 4. Fetch forecast
        const forecastData = await analyticsService.getForecast(userId);
        const forecast = totalSpent + forecastData.forecastSpend;
        // Trigger conditions:
        // - Spending > 80% of budget
        // - Spending trend unusually high (forecast > budget)
        const spendingRatio = totalSpent / budget.amount;
        const isOverspending = spendingRatio > 0.8 || forecast > budget.amount;
        if (!isOverspending) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No overspending detected',
            });
        }
        // 5. Call Gemini to generate alert
        const alert = await alertService.generateAlert({
            totalSpent,
            budget: budget.amount,
            categoryBreakdown,
            forecast,
        });
        res.status(200).json({
            success: true,
            data: alert,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAlert = getAlert;
