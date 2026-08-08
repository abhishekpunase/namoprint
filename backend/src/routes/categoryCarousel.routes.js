import { Router } from 'express';
import { listPublicCategoryCarousel } from '../controllers/categoryCarousel.controller.js';

export const categoryCarouselRoutes = Router();

categoryCarouselRoutes.get('/', listPublicCategoryCarousel);
