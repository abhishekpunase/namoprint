import { Router } from 'express';
import {
  adminListProductLabelStickerProducts,
  createProductLabelStickerProduct,
  deleteProductLabelStickerProduct,
  getProductLabelStickerProduct,
  listProductLabelStickerProducts,
  updateProductLabelStickerProduct,
} from '../controllers/productLabelStickerProduct.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  productLabelStickerProductListSchema,
  productLabelStickerProductSchema,
  productLabelStickerProductUpdateSchema,
} from '../validators/productLabelStickerProduct.validator.js';

export const productLabelStickerProductRoutes = Router();

productLabelStickerProductRoutes.get('/', validate(productLabelStickerProductListSchema), listProductLabelStickerProducts);
productLabelStickerProductRoutes.get('/:slug', getProductLabelStickerProduct);

productLabelStickerProductRoutes.get('/admin/all', protect, authorize('admin'), adminListProductLabelStickerProducts);
productLabelStickerProductRoutes.post(
  '/admin/create',
  protect,
  authorize('admin'),
  validate(productLabelStickerProductSchema),
  createProductLabelStickerProduct,
);
productLabelStickerProductRoutes.patch(
  '/admin/:id',
  protect,
  authorize('admin'),
  validate(productLabelStickerProductUpdateSchema),
  updateProductLabelStickerProduct,
);
productLabelStickerProductRoutes.delete('/admin/:id', protect, authorize('admin'), deleteProductLabelStickerProduct);
