import prisma from '../prisma';
import { categorizeExpense } from './ai.service';

export interface CreateExpenseData {
  amount: number;
  category?: string; // Category is now optional
  description?: string;
  userId: string;
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
    },
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
    orderBy: {
      createdAt: 'desc',
    },
  });
};
