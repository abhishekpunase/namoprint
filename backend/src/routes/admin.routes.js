import { Router } from 'express';
import {
  getAdminUser,
  getDashboardStats,
  listAdminCategories,
  listAdminProducts,
  listAdminUsers,
  updateUserStatus
} from '../controllers/admin.controller.js';
import {
  createCategory,
  deleteCategory,
  updateCategory
} from '../controllers/category.controller.js';
import { getOrder, listAdminOrders, updateOrderStatus, downloadOrderItemDesign, downloadOrderItemAsset } from '../controllers/order.controller.js';
import {
  createProduct,
  deleteProduct,
  updateProduct
} from '../controllers/product.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { adminListSchema, userStatusSchema } from '../validators/admin.validator.js';
import { homeSlideSchema, homeSlideUpdateSchema } from '../validators/homeSlide.validator.js';
import {
  categoryCarouselSchema,
  categoryCarouselUpdateSchema,
} from '../validators/categoryCarousel.validator.js';
import {
  homeTestimonialSchema,
  homeTestimonialUpdateSchema,
  homeTestimonialSectionSchema,
} from '../validators/homeTestimonial.validator.js';
import {
  homeOfferMarqueeSchema,
  homeOfferMarqueeUpdateSchema,
} from '../validators/homeOfferMarquee.validator.js';
import {
  productReelSchema,
  productReelUpdateSchema,
} from '../validators/productReel.validator.js';
import { categorySchema, categoryUpdateSchema } from '../validators/category.validator.js';
import {
  createReview,
  deleteReview,
  listAdminReviews,
  updateReview,
} from '../controllers/productReview.controller.js';
import { productReviewSchema, productReviewUpdateSchema } from '../validators/productReview.validator.js';
import {
  createHomeSlide,
  deleteHomeSlide,
  listAdminHomeSlides,
  updateHomeSlide,
} from '../controllers/homeSlide.controller.js';
import {
  createCategoryCarouselItem,
  deleteCategoryCarouselItem,
  listAdminCategoryCarousel,
  updateCategoryCarouselItem,
} from '../controllers/categoryCarousel.controller.js';
import {
  createHomeTestimonial,
  deleteHomeTestimonial,
  listAdminHomeTestimonials,
  updateHomeTestimonial,
  updateHomeTestimonialSection,
} from '../controllers/homeTestimonial.controller.js';
import {
  createHomeOfferMarqueeItem,
  deleteHomeOfferMarqueeItem,
  listAdminHomeOfferMarquee,
  updateHomeOfferMarqueeItem,
} from '../controllers/homeOfferMarquee.controller.js';
import {
  createProductReel,
  deleteProductReel,
  listAdminProductReels,
  updateProductReel,
} from '../controllers/productReel.controller.js';
import {
  getAdminIntegrations,
  sendAdminTestEmail,
  testAdminShiprocket,
  updateAdminIntegrations,
} from '../controllers/integrations.controller.js';
import {
  integrationsUpdateSchema,
  testEmailSchema,
} from '../validators/integrations.validator.js';
import { orderStatusSchema } from '../validators/order.validator.js';
import { productSchema, productUpdateSchema } from '../validators/product.validator.js';

export const adminRoutes = Router();

adminRoutes.use(protect, authorize('admin'));
adminRoutes.get('/dashboard', getDashboardStats);

adminRoutes.get('/orders', listAdminOrders);
adminRoutes.get('/orders/:id', getOrder);
adminRoutes.get('/orders/:id/items/:itemId/design', downloadOrderItemDesign);
adminRoutes.get('/orders/:id/items/:itemId/asset/:assetType', downloadOrderItemAsset);
adminRoutes.patch('/orders/:id/status', validate(orderStatusSchema), updateOrderStatus);

adminRoutes.get('/users', validate(adminListSchema), listAdminUsers);
adminRoutes.get('/users/:id', getAdminUser);
adminRoutes.patch('/users/:id/status', validate(userStatusSchema), updateUserStatus);

adminRoutes.get('/products', validate(adminListSchema), listAdminProducts);
adminRoutes.post('/products', validate(productSchema), createProduct);
adminRoutes.patch('/products/:id', validate(productUpdateSchema), updateProduct);
adminRoutes.delete('/products/:id', deleteProduct);

adminRoutes.get('/categories', listAdminCategories);
adminRoutes.post('/categories', validate(categorySchema), createCategory);
adminRoutes.patch('/categories/:id', validate(categoryUpdateSchema), updateCategory);
adminRoutes.delete('/categories/:id', deleteCategory);

adminRoutes.get('/home-slides', listAdminHomeSlides);
adminRoutes.post('/home-slides', validate(homeSlideSchema), createHomeSlide);
adminRoutes.patch('/home-slides/:id', validate(homeSlideUpdateSchema), updateHomeSlide);
adminRoutes.delete('/home-slides/:id', deleteHomeSlide);

adminRoutes.get('/category-carousel', listAdminCategoryCarousel);
adminRoutes.post('/category-carousel', validate(categoryCarouselSchema), createCategoryCarouselItem);
adminRoutes.patch('/category-carousel/:id', validate(categoryCarouselUpdateSchema), updateCategoryCarouselItem);
adminRoutes.delete('/category-carousel/:id', deleteCategoryCarouselItem);

adminRoutes.get('/home-testimonials', listAdminHomeTestimonials);
adminRoutes.patch('/home-testimonials/section', validate(homeTestimonialSectionSchema), updateHomeTestimonialSection);
adminRoutes.post('/home-testimonials', validate(homeTestimonialSchema), createHomeTestimonial);
adminRoutes.patch('/home-testimonials/:id', validate(homeTestimonialUpdateSchema), updateHomeTestimonial);
adminRoutes.delete('/home-testimonials/:id', deleteHomeTestimonial);

adminRoutes.get('/home-offer-marquee', listAdminHomeOfferMarquee);
adminRoutes.post('/home-offer-marquee', validate(homeOfferMarqueeSchema), createHomeOfferMarqueeItem);
adminRoutes.patch('/home-offer-marquee/:id', validate(homeOfferMarqueeUpdateSchema), updateHomeOfferMarqueeItem);
adminRoutes.delete('/home-offer-marquee/:id', deleteHomeOfferMarqueeItem);

adminRoutes.get('/product-reels', listAdminProductReels);
adminRoutes.post('/product-reels', validate(productReelSchema), createProductReel);
adminRoutes.patch('/product-reels/:id', validate(productReelUpdateSchema), updateProductReel);
adminRoutes.delete('/product-reels/:id', deleteProductReel);

adminRoutes.get('/integrations', getAdminIntegrations);
adminRoutes.patch('/integrations', validate(integrationsUpdateSchema), updateAdminIntegrations);
adminRoutes.post('/integrations/test-email', validate(testEmailSchema), sendAdminTestEmail);
adminRoutes.post('/integrations/test-shiprocket', testAdminShiprocket);

adminRoutes.get('/reviews', listAdminReviews);
adminRoutes.post('/reviews', validate(productReviewSchema), createReview);
adminRoutes.patch('/reviews/:id', validate(productReviewUpdateSchema), updateReview);
adminRoutes.delete('/reviews/:id', deleteReview);
