import { Router } from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPaymentSchema, verifyPaymentSchema } from '../validators/payment.validator.js';

export const paymentRoutes = Router();

paymentRoutes.post('/razorpay/order', protect, validate(createPaymentSchema), createPaymentOrder);
paymentRoutes.post('/razorpay/verify', protect, validate(verifyPaymentSchema), verifyPayment);
paymentRoutes.post('/webhook', (_req, res) => res.json({ success: true, received: true }));
