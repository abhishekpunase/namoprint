import { Router } from 'express';
import {
  adminListCorporateGiftProducts,
  createCorporateGiftProduct,
  deleteCorporateGiftProduct,
  getCorporateGiftProduct,
  listCorporateGiftProducts,
  updateCorporateGiftProduct,
} from '../controllers/corporateGiftProduct.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  corporateGiftProductListSchema,
  corporateGiftProductSchema,
  corporateGiftProductUpdateSchema,
} from '../validators/corporateGiftProduct.validator.js';

export const corporateGiftProductRoutes = Router();

corporateGiftProductRoutes.get('/', validate(corporateGiftProductListSchema), listCorporateGiftProducts);
corporateGiftProductRoutes.get('/:slug', getCorporateGiftProduct);

corporateGiftProductRoutes.get('/admin/all', protect, authorize('admin'), adminListCorporateGiftProducts);
corporateGiftProductRoutes.post(
  '/admin/create',
  protect,
  authorize('admin'),
  validate(corporateGiftProductSchema),
  createCorporateGiftProduct,
);
corporateGiftProductRoutes.patch(
  '/admin/:id',
  protect,
  authorize('admin'),
  validate(corporateGiftProductUpdateSchema),
  updateCorporateGiftProduct,
);
corporateGiftProductRoutes.delete('/admin/:id', protect, authorize('admin'), deleteCorporateGiftProduct);
