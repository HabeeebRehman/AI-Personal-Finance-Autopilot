import prisma from '../prisma';
import { categorizeExpense } from './ai.service';

export interface CreateExpenseData {
  amount: number;
  category?: string; // Category is now optional
  description?: string;
  userId: string;
  date?: string | Date;
}

/**
 * Create a new expense, with AI-powered categorization.
 */
export const createExpense = async (data: CreateExpenseData) => {
  let category = data.category;

  // If category is not provided and a description exists, use AI to categorize it
  if (!category && data.description) {
    category = await categorizeExpense(data.description);
  } else if (!category) {
    category = 'Other'; // Default to 'Other' if no category or description
  }

  return await prisma.expense.create({
    data: {
      amount: data.amount,
      category,
      description: data.description,
      userId: data.userId,
      createdAt: data.date ? new Date(data.date) : undefined,
    },
  });
};

/**
 * Bulk create expenses
 */
export const bulkCreateExpenses = async (expenses: CreateExpenseData[]) => {
  return await prisma.expense.createMany({
    data: expenses.map((exp) => ({
      amount: exp.amount,
      category: exp.category || 'Other',
      description: exp.description,
      userId: exp.userId,
      createdAt: exp.date ? new Date(exp.date) : undefined,
    })),
  });
};

/**
 * Get all expenses for a user
 */
export const getExpensesByUserId = async (userId: string) => {
  return await prisma.expense.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      amount: true,
      category: true,
      description: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Get expenses for a user within a specific date range
 */
export const getExpensesByDateRange = async (userId: string, startDate: Date, endDate: Date) => {
  return await prisma.expense.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amount: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};
