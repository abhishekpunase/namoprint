import { Router } from 'express';
import { listPublicHomeSlides } from '../controllers/homeSlide.controller.js';

export const homeSlideRoutes = Router();

homeSlideRoutes.get('/', listPublicHomeSlides);
