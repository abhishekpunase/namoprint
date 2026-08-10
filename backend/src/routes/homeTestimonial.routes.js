import { Router } from 'express';
import { listPublicHomeTestimonials } from '../controllers/homeTestimonial.controller.js';

export const homeTestimonialRoutes = Router();

homeTestimonialRoutes.get('/', listPublicHomeTestimonials);
