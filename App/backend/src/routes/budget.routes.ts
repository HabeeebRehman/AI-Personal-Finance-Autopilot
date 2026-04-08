import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All budget routes require authentication
router.use(protect);

router.post('/', budgetController.setBudget);
router.get('/', budgetController.getBudget);

export default router;
