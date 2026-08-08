import Joi from 'joi';
import { PRODUCT_TYPES } from '../constants/catalog.js';

export const categorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    productType: Joi.string()
      .valid(...PRODUCT_TYPES)
      .required(),
    parent: Joi.string().allow(null, ''),
    description: Joi.string().allow('', null),
    imageUrl: Joi.string().uri().allow('', null),
    sortOrder: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean()
  }),
  params: Joi.object(),
  query: Joi.object()
});

export const categoryUpdateSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(120),
    productType: Joi.string().valid(...PRODUCT_TYPES),
    parent: Joi.string().allow(null, ''),
    description: Joi.string().allow('', null),
    imageUrl: Joi.string().uri().allow('', null),
    sortOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean()
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object()
});
