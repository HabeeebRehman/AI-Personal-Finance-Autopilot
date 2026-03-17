import { Router } from 'express';
import healthRouter from './health.routes';
import userRouter from './user.routes';
import authRouter from './auth.routes';
import expenseRouter from './expense.routes';
import analyticsRouter from './analytics.routes';

import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', protect, userRouter);
router.use('/expenses', expenseRouter);
router.use('/analytics', analyticsRouter);

export default router;
