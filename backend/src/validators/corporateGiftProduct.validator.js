import Joi from 'joi';
import { productSeoSchema } from './productSeo.validator.js';

const qualityOption = Joi.object({
  label: Joi.string().required(),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0).default(100),
  isActive: Joi.boolean().default(true),
});

const corporateGiftProductBody = {
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  highlights: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string()).default([]),
  qualityOptions: Joi.array().items(qualityOption).min(1).required(),
  minOrderQty: Joi.number().integer().min(1).default(1),
  bulkOrderNote: Joi.string().allow('', null),
  ratingScore: Joi.number().min(0).max(5).default(4.8),
  reviewCountLabel: Joi.string().allow('', null),
  whatsappNumber: Joi.string().allow('', null),
  isFeatured: Joi.boolean(),
  isActive: Joi.boolean(),
  sortOrder: Joi.number(),
  seo: productSeoSchema,
};

export const corporateGiftProductSchema = Joi.object({
  body: Joi.object(corporateGiftProductBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const corporateGiftProductUpdateSchema = Joi.object({
  body: Joi.object({
    ...corporateGiftProductBody,
    title: corporateGiftProductBody.title.optional(),
    qualityOptions: Joi.array().items(qualityOption).min(1),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});

export const corporateGiftProductListSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    q: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(20),
  }),
});
