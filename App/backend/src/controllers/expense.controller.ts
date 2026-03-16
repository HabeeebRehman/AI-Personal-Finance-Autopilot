import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as expenseService from '../services/expense.service';

/**
 * Create a new expense
 */
export const createExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
    if (amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Amount and category are required',
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
  } catch (error) {
    next(error);
  }
};

/**
 * Get all expenses for the authenticated user
 */
export const getExpenses = async (
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

    const expenses = await expenseService.getExpensesByUserId(userId);

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};
