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
  babyName: Joi.string().allow('', null),
  birthDate: Joi.string().allow('', null),
  birthTime: Joi.string().allow('', null),
  weight: Joi.string().allow('', null),
  height: Joi.string().allow('', null),
  hospital: Joi.string().allow('', null),
  proudParents: Joi.string().allow('', null),
});

const babyBirthFrameProductBody = {
  title: Joi.string().required(),
  subtitle: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  highlights: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string()).default([]),
  qualityOptions: Joi.array().items(qualityOption).min(1).required(),
  maxPhotos: Joi.number().integer().min(1).max(10).default(3),
  genderOptions: Joi.array().items(Joi.string()).default(['Boy', 'Girl']),
  fieldPlaceholders: fieldPlaceholdersSchema,
  ratingScore: Joi.number().min(0).max(5).default(4.8),
  reviewCountLabel: Joi.string().allow('', null),
  whatsappNumber: Joi.string().allow('', null),
  isFeatured: Joi.boolean(),
  isActive: Joi.boolean(),
  sortOrder: Joi.number(),
  seo: productSeoSchema,
};

export const babyBirthFrameProductSchema = Joi.object({
  body: Joi.object(babyBirthFrameProductBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const babyBirthFrameProductUpdateSchema = Joi.object({
  body: Joi.object({
    ...babyBirthFrameProductBody,
    title: babyBirthFrameProductBody.title.optional(),
    qualityOptions: Joi.array().items(qualityOption).min(1),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});

export const babyBirthFrameProductListSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    q: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
});
