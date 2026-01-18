import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email');

const validatePassword = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long');

router.post(
  '/register',
  [validateEmail, validatePassword],
  register
);

router.post(
  '/login',
  [validateEmail, validatePassword],
  login
);

router.get('/me', authenticate, getMe);

export default router;
