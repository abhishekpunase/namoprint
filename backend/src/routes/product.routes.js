import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct
} from '../controllers/product.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { productListSchema, productSchema, productUpdateSchema } from '../validators/product.validator.js';

export const productRoutes = Router();

productRoutes.get('/', validate(productListSchema), listProducts);
productRoutes.get('/:slug', getProduct);
productRoutes.post('/', protect, authorize('admin'), validate(productSchema), createProduct);
productRoutes.patch('/:id', protect, authorize('admin'), validate(productUpdateSchema), updateProduct);
productRoutes.delete('/:id', protect, authorize('admin'), deleteProduct);
