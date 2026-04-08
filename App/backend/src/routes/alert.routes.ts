import { Router } from 'express';
import * as alertController from '../controllers/alert.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All alert routes require authentication
router.use(protect);

router.get('/', alertController.getAlert);

export default router;
