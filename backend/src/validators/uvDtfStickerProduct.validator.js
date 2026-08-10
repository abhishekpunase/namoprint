import Joi from 'joi';
import { productSeoSchema } from './productSeo.validator.js';

const qualityOption = Joi.object({
  label: Joi.string().required(),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0).default(100),
  isActive: Joi.boolean().default(true),
});

const uvDtfStickerProductBody = {
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  highlights: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string()).default([]),
  qualityOptions: Joi.array().items(qualityOption).min(1).required(),
  logoUploadHint: Joi.string().allow('', null),
  isFeatured: Joi.boolean(),
  isActive: Joi.boolean(),
  sortOrder: Joi.number(),
  seo: productSeoSchema,
};

export const uvDtfStickerProductSchema = Joi.object({
  body: Joi.object(uvDtfStickerProductBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const uvDtfStickerProductUpdateSchema = Joi.object({
  body: Joi.object({
    ...uvDtfStickerProductBody,
    title: uvDtfStickerProductBody.title.optional(),
    qualityOptions: Joi.array().items(qualityOption).min(1),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});

export const uvDtfStickerProductListSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    q: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(20),
  }),
});
