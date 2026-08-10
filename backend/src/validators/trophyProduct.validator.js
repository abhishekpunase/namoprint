import Joi from 'joi';
import { productSeoSchema } from './productSeo.validator.js';

const qualityOption = Joi.object({
  label: Joi.string().required(),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0).default(100),
  isActive: Joi.boolean().default(true),
});

const fieldPlaceholdersSchema = Joi.object({
  mainHeading: Joi.string().allow('', null),
  subHeading: Joi.string().allow('', null),
  thirdLine: Joi.string().allow('', null),
  recipientName: Joi.string().allow('', null),
  eventName: Joi.string().allow('', null),
  awardDate: Joi.string().allow('', null),
  organizationName: Joi.string().allow('', null),
});

const trophyProductBody = {
  title: Joi.string().required(),
  subtitle: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  highlights: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string()).default([]),
  qualityOptions: Joi.array().items(qualityOption).min(1).required(),
  fieldPlaceholders: fieldPlaceholdersSchema,
  allowLogoUpload: Joi.boolean().default(true),
  ratingScore: Joi.number().min(0).max(5).default(4.8),
  reviewCountLabel: Joi.string().allow('', null),
  whatsappNumber: Joi.string().allow('', null),
  isFeatured: Joi.boolean(),
  isActive: Joi.boolean(),
  sortOrder: Joi.number(),
  seo: productSeoSchema,
};

export const trophyProductSchema = Joi.object({
  body: Joi.object(trophyProductBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const trophyProductUpdateSchema = Joi.object({
  body: Joi.object({
    ...trophyProductBody,
    title: trophyProductBody.title.optional(),
    qualityOptions: Joi.array().items(qualityOption).min(1),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});

export const trophyProductListSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    q: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(20),
  }),
});
