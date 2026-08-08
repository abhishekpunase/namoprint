import Joi from 'joi';
import { productSeoSchema } from './productSeo.validator.js';

const qualityOption = Joi.object({
  label: Joi.string().required(),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0).default(100),
  isActive: Joi.boolean().default(true),
});

const productLabelStickerProductBody = {
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  highlights: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string()).default([]),
  qualityOptions: Joi.array().items(qualityOption).min(1).required(),
  labelUploadHint: Joi.string().allow('', null),
  isFeatured: Joi.boolean(),
  isActive: Joi.boolean(),
  sortOrder: Joi.number(),
  seo: productSeoSchema,
};

export const productLabelStickerProductSchema = Joi.object({
  body: Joi.object(productLabelStickerProductBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const productLabelStickerProductUpdateSchema = Joi.object({
  body: Joi.object({
    ...productLabelStickerProductBody,
    title: productLabelStickerProductBody.title.optional(),
    qualityOptions: Joi.array().items(qualityOption).min(1),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});

export const productLabelStickerProductListSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    q: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
});
