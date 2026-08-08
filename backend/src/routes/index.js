import { Router } from 'express';
import { adminRoutes } from './admin.routes.js';
import { accountRoutes } from './account.routes.js';
import { authRoutes } from './auth.routes.js';
import { cartRoutes } from './cart.routes.js';
import { categoryRoutes } from './category.routes.js';
import { couponRoutes } from './coupon.routes.js';
import { orderRoutes } from './order.routes.js';
import { paymentRoutes } from './payment.routes.js';
import { productRoutes } from './product.routes.js';
import { uploadRoutes } from './upload.routes.js';
// NEW: God Photo Frame + Name Plate modules — fully standalone, do not touch any existing routes above.
import { godProductRoutes } from './godProduct.routes.js';
import { namePlateProductRoutes } from './namePlateProduct.routes.js';
import { tShirtProductRoutes } from './tShirtProduct.routes.js';
import { homeSlideRoutes } from './homeSlide.routes.js';
import { productReviewRoutes } from './productReview.routes.js';
import { categoryCarouselRoutes } from './categoryCarousel.routes.js';
import { productReelRoutes } from './productReel.routes.js';
import { corporateGiftProductRoutes } from './corporateGiftProduct.routes.js';
import { babyBirthFrameProductRoutes } from './babyBirthFrameProduct.routes.js';
import { trophyProductRoutes } from './trophyProduct.routes.js';
import { penPrintProductRoutes } from './penPrintProduct.routes.js';
import { uvDtfStickerProductRoutes } from './uvDtfStickerProduct.routes.js';
import { productLabelStickerProductRoutes } from './productLabelStickerProduct.routes.js';
import { contactRoutes } from './contact.routes.js';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/account', accountRoutes);
routes.use('/categories', categoryRoutes);
routes.use('/products', productRoutes);
routes.use('/uploads', uploadRoutes);
routes.use('/cart', cartRoutes);
routes.use('/coupons', couponRoutes);
routes.use('/orders', orderRoutes);
routes.use('/payments', paymentRoutes);
routes.use('/admin', adminRoutes);
// NEW routes (isolated collections: GodProduct/GodOrder, NamePlateProduct/NamePlateOrder)
routes.use('/god-products', godProductRoutes);
routes.use('/nameplates', namePlateProductRoutes);
routes.use('/tshirt-printing', tShirtProductRoutes);
routes.use('/home-slides', homeSlideRoutes);
routes.use('/reviews', productReviewRoutes);
routes.use('/category-carousel', categoryCarouselRoutes);
routes.use('/product-reels', productReelRoutes);
routes.use('/corporate-gifts', corporateGiftProductRoutes);
routes.use('/baby-birth-frames', babyBirthFrameProductRoutes);
routes.use('/trophies', trophyProductRoutes);
routes.use('/pen-prints', penPrintProductRoutes);
routes.use('/uv-dtf-stickers', uvDtfStickerProductRoutes);
routes.use('/product-label-stickers', productLabelStickerProductRoutes);
routes.use('/contact', contactRoutes);

export default routes;
