import prisma from '../prisma';

export interface CreateExpenseData {
  amount: number;
  category: string;
  description?: string;
  userId: string;
}

/**
 * Create a new expense
 */
export const createExpense = async (data: CreateExpenseData) => {
  return await prisma.expense.create({
    data: {
      amount: data.amount,
      category: data.category,
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
