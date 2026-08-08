import Joi from 'joi';

const reviewBody = {
  customerName: Joi.string().min(2).max(120).required(),
  productTitle: Joi.string().max(200).allow('', null),
  productSlug: Joi.string().max(200).allow('', null),
  productType: Joi.string()
    .valid('general', 'product', 'god-product', 'nameplate', 'tshirt', 'wall-watch', 'corporate-gift')
    .default('general'),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().max(200).allow('', null),
  reviewText: Joi.string().min(5).max(2000).required(),
  imageUrl: Joi.string().max(2048).allow('', null),
  isVerified: Joi.boolean(),
  isFeatured: Joi.boolean(),
  isPublished: Joi.boolean(),
  sortOrder: Joi.number().integer().min(0),
};

export const productReviewSchema = Joi.object({
  body: Joi.object(reviewBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const productReviewUpdateSchema = Joi.object({
  body: Joi.object({
    customerName: Joi.string().min(2).max(120),
    productTitle: Joi.string().max(200).allow('', null),
    productSlug: Joi.string().max(200).allow('', null),
    productType: Joi.string().valid('general', 'product', 'god-product', 'nameplate', 'tshirt', 'wall-watch'),
    rating: Joi.number().integer().min(1).max(5),
    title: Joi.string().max(200).allow('', null),
    reviewText: Joi.string().min(5).max(2000),
    imageUrl: Joi.string().max(2048).allow('', null),
    isVerified: Joi.boolean(),
    isFeatured: Joi.boolean(),
    isPublished: Joi.boolean(),
    sortOrder: Joi.number().integer().min(0),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});
