import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} from '../controllers/category.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { categorySchema, categoryUpdateSchema } from '../validators/category.validator.js';

export const categoryRoutes = Router();

categoryRoutes.get('/', listCategories);
categoryRoutes.post('/', protect, authorize('admin'), validate(categorySchema), createCategory);
categoryRoutes.patch('/:id', protect, authorize('admin'), validate(categoryUpdateSchema), updateCategory);
categoryRoutes.delete('/:id', protect, authorize('admin'), deleteCategory);
