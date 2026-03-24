import { Router } from 'express';
import * as insightController from '../controllers/insight.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

/**
 * Route: GET /insights/weekly
 * Description: Generates weekly AI-powered financial insights for the user.
 */
router.get('/weekly', protect, insightController.getWeeklyInsights);

export default router;
