import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import prisma from '../prisma';
import { AppError } from './error.middleware';

/**
 * Extend Express Request to include user data
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Middleware to protect routes and verify JWT token
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // Check if token is present in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(401, 'Not authorized, token missing'));
  }

  try {
    // Verify token
    const decoded: any = jwt.verify(token, config.jwtSecret);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return next(new AppError(401, 'Not authorized, user not found'));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return next(new AppError(401, 'Not authorized, token invalid'));
  }
};
