import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  windowMs: env.rateLimitWindowMs
};

export const apiLimiter = rateLimit({
  ...base,
  max: env.nodeEnv === 'development' ? 2000 : env.rateLimitMax,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

export const authLimiter = rateLimit({
  ...base,
  max: env.nodeEnv === 'development' ? 100 : env.authRateLimitMax,
  message: { success: false, message: 'Too many auth attempts. Please wait.' }
});

export const uploadLimiter = rateLimit({
  ...base,
  max: env.uploadRateLimitMax,
  message: { success: false, message: 'Too many uploads. Please wait.' }
});
