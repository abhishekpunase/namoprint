import { Router } from 'express';
import {
  adminListBabyBirthFrameProducts,
  createBabyBirthFrameProduct,
  deleteBabyBirthFrameProduct,
  getBabyBirthFrameProduct,
  listBabyBirthFrameProducts,
  updateBabyBirthFrameProduct,
} from '../controllers/babyBirthFrameProduct.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  babyBirthFrameProductListSchema,
  babyBirthFrameProductSchema,
  babyBirthFrameProductUpdateSchema,
} from '../validators/babyBirthFrameProduct.validator.js';

export const babyBirthFrameProductRoutes = Router();

babyBirthFrameProductRoutes.get('/', validate(babyBirthFrameProductListSchema), listBabyBirthFrameProducts);
babyBirthFrameProductRoutes.get('/:slug', getBabyBirthFrameProduct);

babyBirthFrameProductRoutes.get('/admin/all', protect, authorize('admin'), adminListBabyBirthFrameProducts);
babyBirthFrameProductRoutes.post(
  '/admin/create',
  protect,
  authorize('admin'),
  validate(babyBirthFrameProductSchema),
  createBabyBirthFrameProduct,
);
babyBirthFrameProductRoutes.patch(
  '/admin/:id',
  protect,
  authorize('admin'),
  validate(babyBirthFrameProductUpdateSchema),
  updateBabyBirthFrameProduct,
);
babyBirthFrameProductRoutes.delete('/admin/:id', protect, authorize('admin'), deleteBabyBirthFrameProduct);
