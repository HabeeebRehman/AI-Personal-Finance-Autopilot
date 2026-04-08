import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as budgetService from '../services/budget.service';

/**
 * Set or update monthly budget
 */
export const setBudget = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Get current month budget
 */
export const getBudget = async (
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

    // Get current month and year if not provided in query
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month as string) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string) : now.getFullYear();

    const budget = await budgetService.getBudget(userId, month, year);

    res.status(200).json({
      success: true,
      data: budget || { amount: 0, month, year },
    });
  } catch (error) {
    next(error);
  }
};
