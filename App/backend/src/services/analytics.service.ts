import prisma from '../prisma';

const MOCKED_MONTHLY_INCOME = 50000;

/**
 * Calculates the start and end dates for the current month.
 */
const getCurrentMonthBounds = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999); // End of the last day
  return { startDate, endDate };
};

/** 
 * FEATURE 1: Get spending analytics by category for the current month.
 */
export const getCategoryAnalytics = async (userId: string) => {
  const { startDate, endDate } = getCurrentMonthBounds();

  const result = await prisma.expense.groupBy({
    by: ['category'],
    _sum: {
      amount: true,
    },
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
  });

  return result.map((item) => ({
    category: item.category,
    total: item._sum.amount || 0,
  }));
};

/**
 * FEATURE 2: Forecast future spending for the current month.
 */
export const getForecast = async (userId: string) => {
  const { startDate, endDate } = getCurrentMonthBounds();
  const now = new Date();
  
  const daysInMonth = endDate.getDate();
  const daysPassed = now.getDate();
  const remainingDays = daysInMonth - daysPassed;

  const expensesThisMonth = await prisma.expense.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: now, // Only consider expenses up to today
      },
    },
  });

  const totalSpentThisMonth = expensesThisMonth.reduce((sum, exp) => sum + exp.amount, 0);
  const avgDailySpend = daysPassed > 0 ? totalSpentThisMonth / daysPassed : 0;
  const forecastSpend = avgDailySpend * remainingDays;

  return {
    avgDailySpend: parseFloat(avgDailySpend.toFixed(2)),
    remainingDays,
    forecastSpend: parseFloat(forecastSpend.toFixed(2)),
  };
};

/**
 * FEATURE 3: Calculate the user's financial health score.
 */
export const getFinancialHealth = async (userId: string) => {
  const { startDate, endDate } = getCurrentMonthBounds();

  const expensesThisMonth = await prisma.expense.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalExpenses = expensesThisMonth.reduce((sum, exp) => sum + exp.amount, 0);
  const savingsRatio = (MOCKED_MONTHLY_INCOME - totalExpenses) / MOCKED_MONTHLY_INCOME;

  // Calculate spending volatility (standard deviation of daily spending)
  const spendingByDay: { [key: string]: number } = {};
  expensesThisMonth.forEach(exp => {
    const day = exp.createdAt.toISOString().split('T')[0];
    spendingByDay[day] = (spendingByDay[day] || 0) + exp.amount;
  });

  const dailyTotals = Object.values(spendingByDay);
  const mean = dailyTotals.length > 0 ? dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length : 0;
  const variance = dailyTotals.length > 0 ? dailyTotals.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / dailyTotals.length : 0;
  const volatility = Math.sqrt(variance);

  // Calculate health score
  let healthScore = 100;
  if (savingsRatio < 0.1) healthScore -= 30;
  else if (savingsRatio < 0.2) healthScore -= 15;

  if (volatility > mean * 0.5 && mean > 0) healthScore -= 20; // High volatility if std dev is > 50% of mean

  return {
    healthScore: Math.max(0, Math.round(healthScore)), // Ensure score is not negative
    savingsRatio: parseFloat(savingsRatio.toFixed(2)),
    volatility: parseFloat(volatility.toFixed(2)),
  };
};
