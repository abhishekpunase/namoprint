import { Router } from 'express';
import {
  login,
  loginAdmin,
  logout,
  forgotPassword,
  me,
  refreshToken,
  register,
  registerAdmin,
  resetPassword
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  adminRegisterSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema
} from '../validators/auth.validator.js';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, validate(registerSchema), register);
authRoutes.post('/login', authLimiter, validate(loginSchema), login);
authRoutes.post('/admin/register', authLimiter, validate(adminRegisterSchema), registerAdmin);
authRoutes.post('/admin/login', authLimiter, validate(loginSchema), loginAdmin);
authRoutes.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
authRoutes.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
authRoutes.post('/refresh', validate(refreshSchema), refreshToken);
authRoutes.post('/logout', protect, logout);
authRoutes.get('/me', protect, me);
