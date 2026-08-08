import { Router } from 'express';
import {
  addAddress,
  deleteAddress,
  getMyPaymentHistory,
  getMyPurchaseHistory,
  getProfile,
  updateProfile
} from '../controllers/account.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { addressSchema, profileSchema } from '../validators/account.validator.js';

export const accountRoutes = Router();

accountRoutes.use(protect);
accountRoutes.get('/profile', getProfile);
accountRoutes.patch('/profile', validate(profileSchema), updateProfile);
accountRoutes.post('/addresses', validate(addressSchema), addAddress);
accountRoutes.delete('/addresses/:addressId', deleteAddress);
accountRoutes.get('/orders', getMyPurchaseHistory);
accountRoutes.get('/payments', getMyPaymentHistory);
