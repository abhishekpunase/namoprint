import { Router } from 'express';
import { getPublicSettings, submitContactForm } from '../controllers/integrations.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { contactFormSchema } from '../validators/integrations.validator.js';
import rateLimit from 'express-rate-limit';

export const contactRoutes = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many contact messages. Please try again later.' },
});

contactRoutes.get('/settings', getPublicSettings);
contactRoutes.post('/', contactLimiter, validate(contactFormSchema), submitContactForm);
