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
exports.getExpenses = exports.createExpense = exports.importExpenses = void 0;
const expenseService = __importStar(require("../services/expense.service"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
/**
 * Import expenses from CSV
 */
const importExpenses = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user ID missing from request',
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a CSV file',
            });
        }
        const results = [];
        const filePath = req.file.path;
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
            try {
                const formattedExpenses = results.map((row) => {
                    const amount = parseFloat(row.amount);
                    const date = new Date(row.date);
                    return {
                        amount: isNaN(amount) ? 0 : amount,
                        category: row.category || 'Other',
                        description: row.description || '',
                        date: isNaN(date.getTime()) ? new Date() : date,
                        userId,
                    };
                });
                // Filter out invalid amounts
                const validExpenses = formattedExpenses.filter(exp => exp.amount > 0);
                if (validExpenses.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No valid expenses found in CSV',
                    });
                }
                const response = await expenseService.bulkCreateExpenses(validExpenses);
                // Delete temp file
                fs_1.default.unlinkSync(filePath);
                res.status(200).json({
                    success: true,
                    inserted: response.count,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.importExpenses = importExpenses;
/**
 * Create a new expense
 */
const createExpense = async (req, res, next) => {
    try {
        const { amount, category, description } = req.body;
        const userId = req.user?.id;
        // Validate userId
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user ID missing from request',
            });
        }
        // Validate missing fields
        if (amount === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required',
            });
        }
        // A category is only required if a description is not provided for the AI to use.
        if (!category && !description) {
            return res.status(400).json({
                success: false,
                message: 'Category or description is required for AI categorization',
            });
        }
        // Validate amount > 0
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a number greater than 0',
            });
        }
        const expense = await expenseService.createExpense({
            amount,
            category,
            description,
            userId,
        });
        res.status(201).json({
            success: true,
            data: expense,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createExpense = createExpense;
/**
 * Get all expenses for the authenticated user
 */
const getExpenses = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user ID missing from request',
            });
        }
        const expenses = await expenseService.getExpensesByUserId(userId);
        res.status(200).json({
            success: true,
            data: expenses,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getExpenses = getExpenses;
