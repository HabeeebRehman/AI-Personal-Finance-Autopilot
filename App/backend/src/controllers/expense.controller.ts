import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as expenseService from '../services/expense.service';
import csv from 'csv-parser';
import fs from 'fs';

/**
 * Import expenses from CSV
 */
export const importExpenses = async (
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file',
      });
    }

    const results: any[] = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const formattedExpenses = results.map((row) => {
            const amount = parseFloat(row.amount);
            const date = new Date(row.date);
            
            return {
              amount: isNaN(amount) ? 0 : amount,
              category: row.category || 'Other',
              description: row.description || '',
              date: isNaN(date.getTime()) ? new Date() : date,
              userId,
            };
          });

          // Filter out invalid amounts
          const validExpenses = formattedExpenses.filter(exp => exp.amount > 0);

          if (validExpenses.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'No valid expenses found in CSV',
            });
          }

          const response = await expenseService.bulkCreateExpenses(validExpenses);

          // Delete temp file
          fs.unlinkSync(filePath);

          res.status(200).json({
            success: true,
            inserted: response.count,
          });
        } catch (error) {
          next(error);
        }
      });
  } catch (error) {
    next(error);
  }
};

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
    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    // A category is only required if a description is not provided for the AI to use.
    if (!category && !description) {
      return res.status(400).json({
        success: false,
        message: 'Category or description is required for AI categorization',
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
