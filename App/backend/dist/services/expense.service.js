"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpensesByUserId = exports.createExpense = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const ai_service_1 = require("./ai.service");
/**
 * Create a new expense, with AI-powered categorization.
 */
const createExpense = async (data) => {
    let category = data.category;
    // If category is not provided and a description exists, use AI to categorize it
    if (!category && data.description) {
        category = await (0, ai_service_1.categorizeExpense)(data.description);
    }
    else if (!category) {
        category = 'Other'; // Default to 'Other' if no category or description
    }
    return await prisma_1.default.expense.create({
        data: {
            amount: data.amount,
            category,
            description: data.description,
            userId: data.userId,
        },
    });
};
exports.createExpense = createExpense;
/**
 * Get all expenses for a user
 */
const getExpensesByUserId = async (userId) => {
    return await prisma_1.default.expense.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};
exports.getExpensesByUserId = getExpensesByUserId;
