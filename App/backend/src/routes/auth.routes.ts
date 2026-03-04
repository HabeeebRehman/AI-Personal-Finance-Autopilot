import { z } from 'zod';
import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Registration validation schema
const registerSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long'),
    name: z.string().optional(),
  }),
});

// Login validation schema
const loginSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
    password: z.string({ message: 'Password is required' }),
  }),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;
