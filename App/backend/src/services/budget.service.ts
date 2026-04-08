import prisma from '../prisma';

export interface SetBudgetData {
  userId: string;
  amount: number;
  month: number;
  year: number;
}

/**
 * Set or update a monthly budget
 */
export const setBudget = async (data: SetBudgetData) => {
  return await prisma.budget.upsert({
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

/**
 * Get budget for a specific month and year
 */
export const getBudget = async (userId: string, month: number, year: number) => {
  return await prisma.budget.findUnique({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
  });
};
