import { Router } from 'express';
import {
  adminListNamePlateOrders,
  adminListNamePlateProducts,
  adminUpdateNamePlateOrderStatus,
  createNamePlateOrder,
  createNamePlateProduct,
  deleteNamePlateProduct,
  getNamePlateProduct,
  listNamePlateProducts,
  updateNamePlateProduct
} from '../controllers/namePlateProduct.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  namePlateOrderSchema,
  namePlateOrderStatusSchema,
  namePlateProductListSchema,
  namePlateProductSchema,
  namePlateProductUpdateSchema
} from '../validators/namePlateProduct.validator.js';

export const namePlateProductRoutes = Router();

// Public catalog
namePlateProductRoutes.get('/', validate(namePlateProductListSchema), listNamePlateProducts);
namePlateProductRoutes.get('/:slug', getNamePlateProduct);

// Public order (this is where heading + subtext text gets submitted & saved)
namePlateProductRoutes.post('/orders', validate(namePlateOrderSchema), createNamePlateOrder);

// Admin catalog management
namePlateProductRoutes.get('/admin/all', protect, authorize('admin'), adminListNamePlateProducts);
namePlateProductRoutes.post(
  '/admin/create',
  protect,
  authorize('admin'),
  validate(namePlateProductSchema),
  createNamePlateProduct
);
namePlateProductRoutes.patch(
  '/admin/:id',
  protect,
  authorize('admin'),
  validate(namePlateProductUpdateSchema),
  updateNamePlateProduct
);
namePlateProductRoutes.delete('/admin/:id', protect, authorize('admin'), deleteNamePlateProduct);

// Admin order management (see exactly what text each customer wants)
namePlateProductRoutes.get('/admin/orders/all', protect, authorize('admin'), adminListNamePlateOrders);
namePlateProductRoutes.patch(
  '/admin/orders/:id/status',
  protect,
  authorize('admin'),
  validate(namePlateOrderStatusSchema),
  adminUpdateNamePlateOrderStatus
);
