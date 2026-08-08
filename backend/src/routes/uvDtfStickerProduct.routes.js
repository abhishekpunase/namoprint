import { Router } from 'express';
import {
  adminListUvDtfStickerProducts,
  createUvDtfStickerProduct,
  deleteUvDtfStickerProduct,
  getUvDtfStickerProduct,
  listUvDtfStickerProducts,
  updateUvDtfStickerProduct,
} from '../controllers/uvDtfStickerProduct.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  uvDtfStickerProductListSchema,
  uvDtfStickerProductSchema,
  uvDtfStickerProductUpdateSchema,
} from '../validators/uvDtfStickerProduct.validator.js';

export const uvDtfStickerProductRoutes = Router();

uvDtfStickerProductRoutes.get('/', validate(uvDtfStickerProductListSchema), listUvDtfStickerProducts);
uvDtfStickerProductRoutes.get('/:slug', getUvDtfStickerProduct);

uvDtfStickerProductRoutes.get('/admin/all', protect, authorize('admin'), adminListUvDtfStickerProducts);
uvDtfStickerProductRoutes.post(
  '/admin/create',
  protect,
  authorize('admin'),
  validate(uvDtfStickerProductSchema),
  createUvDtfStickerProduct,
);
uvDtfStickerProductRoutes.patch(
  '/admin/:id',
  protect,
  authorize('admin'),
  validate(uvDtfStickerProductUpdateSchema),
  updateUvDtfStickerProduct,
);
uvDtfStickerProductRoutes.delete('/admin/:id', protect, authorize('admin'), deleteUvDtfStickerProduct);
