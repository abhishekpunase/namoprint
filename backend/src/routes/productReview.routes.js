import { Router } from 'express';
import { listPublicReviews } from '../controllers/productReview.controller.js';

export const productReviewRoutes = Router();

productReviewRoutes.get('/', listPublicReviews);
