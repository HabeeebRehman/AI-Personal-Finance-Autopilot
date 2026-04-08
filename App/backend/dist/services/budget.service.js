"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudget = exports.setBudget = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/**
 * Set or update a monthly budget
 */
const setBudget = async (data) => {
    return await prisma_1.default.budget.upsert({
        where: {
            userId_month_year: {
                userId: data.userId,
                month: data.month,
                year: data.year,
            },
        },
        update: {
            amount: data.amount,
        },
        create: {
            userId: data.userId,
            amount: data.amount,
            month: data.month,
            year: data.year,
        },
    });
};
exports.setBudget = setBudget;
/**
 * Get budget for a specific month and year
 */
const getBudget = async (userId, month, year) => {
    return await prisma_1.default.budget.findUnique({
        where: {
            userId_month_year: {
                userId,
                month,
                year,
            },
        },
    });
};
exports.getBudget = getBudget;
