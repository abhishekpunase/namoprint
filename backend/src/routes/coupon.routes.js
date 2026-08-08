import { Router } from 'express';
import { listCoupons, validateCoupon } from '../controllers/coupon.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateCouponSchema } from '../validators/coupon.validator.js';

export const couponRoutes = Router();

couponRoutes.get('/', listCoupons);
couponRoutes.post('/validate', protect, validate(validateCouponSchema), validateCoupon);
