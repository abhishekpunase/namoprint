import Joi from 'joi';
import { productSeoSchema } from './productSeo.validator.js';

const tShirtProductBody = {
  title: Joi.string().required(),
  slug: Joi.string(),
  description: Joi.string().allow(''),
  longDescription: Joi.string().allow(''),
  highlights: Joi.array().items(Joi.string()),
  images: Joi.array().items(Joi.string()),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0),
  sizes: Joi.array().items(Joi.string()),
  stock: Joi.number().integer().min(0),
  rating: Joi.number().min(0).max(5),
  reviewCount: Joi.number().integer().min(0),
  isFeatured: Joi.boolean(),
  isActive: Joi.boolean(),
  sortOrder: Joi.number().integer(),
  seo: productSeoSchema
};

export const tShirtProductSchema = Joi.object({
  body: Joi.object(tShirtProductBody),
  params: Joi.object(),
  query: Joi.object()
});

export const tShirtProductUpdateSchema = Joi.object({
  body: Joi.object({ ...tShirtProductBody, title: tShirtProductBody.title.optional() }),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object()
});

export const tShirtProductListSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    q: Joi.string().allow(''),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(20)
  })
});
