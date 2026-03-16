import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All expense routes require authentication
router.use(protect);

router.post('/', expenseController.createExpense);
router.get('/', expenseController.getExpenses);

export default router;
