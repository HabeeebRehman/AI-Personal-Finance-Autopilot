import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.use(protect);

router.get('/category', analyticsController.getCategoryAnalytics);
router.get('/forecast', analyticsController.getForecast);
router.get('/health', analyticsController.getFinancialHealth);

export default router;
