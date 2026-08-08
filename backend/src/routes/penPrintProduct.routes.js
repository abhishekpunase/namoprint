import { Router } from 'express';
import {
  adminListPenPrintProducts,
  createPenPrintProduct,
  deletePenPrintProduct,
  getPenPrintProduct,
  listPenPrintProducts,
  updatePenPrintProduct,
} from '../controllers/penPrintProduct.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  penPrintProductListSchema,
  penPrintProductSchema,
  penPrintProductUpdateSchema,
} from '../validators/penPrintProduct.validator.js';

export const penPrintProductRoutes = Router();

penPrintProductRoutes.get('/', validate(penPrintProductListSchema), listPenPrintProducts);
penPrintProductRoutes.get('/:slug', getPenPrintProduct);

penPrintProductRoutes.get('/admin/all', protect, authorize('admin'), adminListPenPrintProducts);
penPrintProductRoutes.post(
  '/admin/create',
  protect,
  authorize('admin'),
  validate(penPrintProductSchema),
  createPenPrintProduct,
);
penPrintProductRoutes.patch(
  '/admin/:id',
  protect,
  authorize('admin'),
  validate(penPrintProductUpdateSchema),
  updatePenPrintProduct,
);
penPrintProductRoutes.delete('/admin/:id', protect, authorize('admin'), deletePenPrintProduct);
