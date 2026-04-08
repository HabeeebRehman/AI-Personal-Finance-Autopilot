import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as alertService from '../services/alert.service';
import * as budgetService from '../services/budget.service';
import * as analyticsService from '../services/analytics.service';
import prisma from '../prisma';

/**
 * Get overspending alert
 */
export const getAlert = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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

    const expenses = await prisma.expense.findMany({
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
    const categoryBreakdown: Record<string, number> = {};
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
  } catch (error) {
    next(error);
  }
};
