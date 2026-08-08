import Joi from 'joi';
import { productSeoSchema } from './productSeo.validator.js';

const qualityOption = Joi.object({
  label: Joi.string().required(),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0).default(100),
  isActive: Joi.boolean().default(true)
});

const namePlateProductBody = {
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  highlights: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string().uri()).default([]),
  qualityOptions: Joi.array().items(qualityOption).min(1).required(),
  headingPlaceholder: Joi.string().allow('', null),
  subTextPlaceholder: Joi.string().allow('', null),
  isFeatured: Joi.boolean(),
  isActive: Joi.boolean(),
  sortOrder: Joi.number(),
  seo: productSeoSchema
};

export const namePlateProductSchema = Joi.object({
  body: Joi.object(namePlateProductBody),
  params: Joi.object(),
  query: Joi.object()
});

export const namePlateProductUpdateSchema = Joi.object({
  body: Joi.object({
    ...namePlateProductBody,
    title: namePlateProductBody.title.optional(),
    qualityOptions: Joi.array().items(qualityOption).min(1)
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object()
});

export const namePlateProductListSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    q: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
});

export const namePlateOrderSchema = Joi.object({
  body: Joi.object({
    namePlateProductId: Joi.string().required(),
    qualityOptionId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).default(1),
    headingText: Joi.string().required(),
    subText: Joi.string().allow('', null),
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

export const namePlateOrderStatusSchema = Joi.object({
  body: Joi.object({
    status: Joi.string()
      .valid('New', 'Contacted', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')
      .required()
  }),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object()
});
