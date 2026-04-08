import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { protect } from '../middleware/auth.middleware';
import multer from 'multer';
import os from 'os';

const upload = multer({ dest: os.tmpdir() });

const router = Router();

// All expense routes require authentication
router.use(protect);

router.post('/', expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.post('/import', upload.single('file'), expenseController.importExpenses);

export default router;
