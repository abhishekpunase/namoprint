import Joi from 'joi';
import { productSeoSchema } from './productSeo.validator.js';

const qualityOption = Joi.object({
  label: Joi.string().required(),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0).default(100),
  isActive: Joi.boolean().default(true)
});

const godProductBody = {
  title: Joi.string().required(),
  deity: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  highlights: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string().uri()).default([]),
  qualityOptions: Joi.array().items(qualityOption).min(1).required(),
  isFeatured: Joi.boolean(),
  isActive: Joi.boolean(),
  sortOrder: Joi.number(),
  seo: productSeoSchema
};

export const godProductSchema = Joi.object({
  body: Joi.object(godProductBody),
  params: Joi.object(),
  query: Joi.object()
});

export const godProductUpdateSchema = Joi.object({
  body: Joi.object({
    ...godProductBody,
    title: godProductBody.title.optional(),
    qualityOptions: Joi.array().items(qualityOption).min(1)
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object()
});

export const godProductListSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    q: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(20)
  })
});

export const godOrderSchema = Joi.object({
  body: Joi.object({
    godProductId: Joi.string().required(),
    qualityOptionId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).default(1),
    customerName: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email({ tlds: false }).allow('', null),
    address: Joi.object({
      line1: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      pincode: Joi.string().allow('', null)
    }).default({}),
    notes: Joi.string().allow('', null)
  }),
  params: Joi.object(),
  query: Joi.object()
});

export const godOrderStatusSchema = Joi.object({
  body: Joi.object({
    status: Joi.string()
      .valid('New', 'Contacted', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')
      .required()
  }),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object()
});
