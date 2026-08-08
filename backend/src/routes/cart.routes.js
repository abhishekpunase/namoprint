import { Router } from 'express';
import {
  addCartItem,
  getCart,
  removeCartItem,
  syncCart,
  updateCartItem
} from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { addCartItemSchema, syncCartSchema, updateCartItemSchema } from '../validators/cart.validator.js';

export const cartRoutes = Router();

cartRoutes.use(protect);
cartRoutes.get('/', getCart);
cartRoutes.post('/sync', validate(syncCartSchema), syncCart);
cartRoutes.post('/items', validate(addCartItemSchema), addCartItem);
cartRoutes.patch('/items/:itemId', validate(updateCartItemSchema), updateCartItem);
cartRoutes.delete('/items/:itemId', removeCartItem);
