import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

/**
 * Handle user registration
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data: user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await authService.login(req.body);

    res.status(200).json({
      success: true,
      data: user,
      token,
    });
  } catch (error) {
    next(error);
  }
};
