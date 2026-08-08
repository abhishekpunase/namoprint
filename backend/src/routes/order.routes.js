import { Router } from 'express';
import { createOrderFromCart, getOrder, listMyOrders } from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { checkoutSchema } from '../validators/order.validator.js';

export const orderRoutes = Router();

orderRoutes.use(protect);
orderRoutes.post('/checkout', validate(checkoutSchema), createOrderFromCart);
orderRoutes.get('/my', listMyOrders);
orderRoutes.get('/:id', getOrder);
