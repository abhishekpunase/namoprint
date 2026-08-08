import { Router } from 'express';
import {
  adminListTShirtProducts,
  createTShirtProduct,
  deleteTShirtProduct,
  getTShirtProduct,
  listTShirtProducts,
  updateTShirtProduct
} from '../controllers/tShirtProduct.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  tShirtProductListSchema,
  tShirtProductSchema,
  tShirtProductUpdateSchema
} from '../validators/tShirtProduct.validator.js';

export const tShirtProductRoutes = Router();

tShirtProductRoutes.get('/', validate(tShirtProductListSchema), listTShirtProducts);

tShirtProductRoutes.get('/admin/all', protect, authorize('admin'), adminListTShirtProducts);
tShirtProductRoutes.post(
  '/admin/create',
  protect,
  authorize('admin'),
  validate(tShirtProductSchema),
  createTShirtProduct
);
tShirtProductRoutes.patch(
  '/admin/:id',
  protect,
  authorize('admin'),
  validate(tShirtProductUpdateSchema),
  updateTShirtProduct
);
tShirtProductRoutes.delete('/admin/:id', protect, authorize('admin'), deleteTShirtProduct);

tShirtProductRoutes.get('/:slug', getTShirtProduct);
