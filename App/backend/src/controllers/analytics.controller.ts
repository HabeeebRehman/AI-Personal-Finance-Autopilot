import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as analyticsService from '../services/analytics.service';

const handleRequest = async (
  serviceFunction: (userId: string) => Promise<any>,
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const data = await serviceFunction(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCategoryAnalytics = (req: AuthRequest, res: Response, next: NextFunction) => 
  handleRequest(analyticsService.getCategoryAnalytics, req, res, next);

export const getForecast = (req: AuthRequest, res: Response, next: NextFunction) => 
  handleRequest(analyticsService.getForecast, req, res, next);

export const getFinancialHealth = (req: AuthRequest, res: Response, next: NextFunction) => 
  handleRequest(analyticsService.getFinancialHealth, req, res, next);
