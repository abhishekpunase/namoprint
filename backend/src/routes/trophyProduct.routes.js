import { Router } from 'express';
import {
  adminListTrophyProducts,
  createTrophyProduct,
  deleteTrophyProduct,
  getTrophyProduct,
  listTrophyProducts,
  updateTrophyProduct,
} from '../controllers/trophyProduct.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  trophyProductListSchema,
  trophyProductSchema,
  trophyProductUpdateSchema,
} from '../validators/trophyProduct.validator.js';

export const trophyProductRoutes = Router();

trophyProductRoutes.get('/', validate(trophyProductListSchema), listTrophyProducts);
trophyProductRoutes.get('/:slug', getTrophyProduct);

trophyProductRoutes.get('/admin/all', protect, authorize('admin'), adminListTrophyProducts);
trophyProductRoutes.post(
  '/admin/create',
  protect,
  authorize('admin'),
  validate(trophyProductSchema),
  createTrophyProduct,
);
trophyProductRoutes.patch(
  '/admin/:id',
  protect,
  authorize('admin'),
  validate(trophyProductUpdateSchema),
  updateTrophyProduct,
);
trophyProductRoutes.delete('/admin/:id', protect, authorize('admin'), deleteTrophyProduct);
