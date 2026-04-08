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
exports.getBudget = exports.setBudget = void 0;
const budgetService = __importStar(require("../services/budget.service"));
/**
 * Set or update monthly budget
 */
const setBudget = async (req, res, next) => {
    try {
        const { amount, month, year } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user ID missing from request',
            });
        }
        if (amount === undefined || month === undefined || year === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Amount, month, and year are required',
            });
        }
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a number greater than 0',
            });
        }
        const budget = await budgetService.setBudget({
            userId,
            amount,
            month,
            year,
        });
        res.status(200).json({
            success: true,
            data: budget,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.setBudget = setBudget;
/**
 * Get current month budget
 */
const getBudget = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user ID missing from request',
            });
        }
        // Get current month and year if not provided in query
        const now = new Date();
        const month = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();
        const budget = await budgetService.getBudget(userId, month, year);
        res.status(200).json({
            success: true,
            data: budget || { amount: 0, month, year },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBudget = getBudget;
