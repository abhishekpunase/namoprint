import { Router } from 'express';
import { listPublicHomeOfferMarquee } from '../controllers/homeOfferMarquee.controller.js';

export const homeOfferMarqueeRoutes = Router();

homeOfferMarqueeRoutes.get('/', listPublicHomeOfferMarquee);
