import { Router } from 'express';
import {
  adminListGodOrders,
  adminListGodProducts,
  adminUpdateGodOrderStatus,
  createGodOrder,
  createGodProduct,
  deleteGodProduct,
  getGodProduct,
  listGodProducts,
  updateGodProduct
} from '../controllers/godProduct.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  godOrderSchema,
  godOrderStatusSchema,
  godProductListSchema,
  godProductSchema,
  godProductUpdateSchema
} from '../validators/godProduct.validator.js';

export const godProductRoutes = Router();

// Public catalog
godProductRoutes.get('/', validate(godProductListSchema), listGodProducts);
godProductRoutes.get('/:slug', getGodProduct);

// Public quick order
godProductRoutes.post('/orders', validate(godOrderSchema), createGodOrder);

// Admin catalog management
godProductRoutes.get('/admin/all', protect, authorize('admin'), adminListGodProducts);
godProductRoutes.post('/admin/create', protect, authorize('admin'), validate(godProductSchema), createGodProduct);
godProductRoutes.patch(
  '/admin/:id',
  protect,
  authorize('admin'),
  validate(godProductUpdateSchema),
  updateGodProduct
);
godProductRoutes.delete('/admin/:id', protect, authorize('admin'), deleteGodProduct);

// Admin order management
godProductRoutes.get('/admin/orders/all', protect, authorize('admin'), adminListGodOrders);
godProductRoutes.patch(
  '/admin/orders/:id/status',
  protect,
  authorize('admin'),
  validate(godOrderStatusSchema),
  adminUpdateGodOrderStatus
);
