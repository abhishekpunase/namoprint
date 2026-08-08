import { Router } from 'express';
import { listPublicProductReels } from '../controllers/productReel.controller.js';

export const productReelRoutes = Router();

productReelRoutes.get('/', listPublicProductReels);
