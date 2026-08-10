import Joi from 'joi';

const mediaUrl = Joi.alternatives().try(
  Joi.string().uri(),
  Joi.string().pattern(/^\/[^\s]+$/),
);

const variant = Joi.object({
  sku: Joi.string().required(),
  size: Joi.string().required(),
  material: Joi.string().default('Acrylic'),
  frameType: Joi.string().default('None'),
  borderType: Joi.string().allow('', null),
  printArea: Joi.object({
    widthMm: Joi.number().min(1),
    heightMm: Joi.number().min(1),
    bleedMm: Joi.number().min(0),
    minDpi: Joi.number().min(72)
  }),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true)
});

const productBody = {
  title: Joi.string().required(),
  productType: Joi.string().required(),
  category: Joi.string().required(),
  subCategory: Joi.string().allow(null, ''),
  description: Joi.string().allow('', null),
  highlights: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(mediaUrl).default([]),
  thumbnail: mediaUrl.allow('', null),
  attributes: Joi.object().unknown(true),
  personalization: Joi.object().unknown(true),
  mockup: Joi.object().unknown(true),
  defaultOptions: Joi.object().unknown(true),
  customizationGroups: Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      label: Joi.string().required(),
      values: Joi.array().items(Joi.string()).min(1).required(),
    }),
  ),
  variants: Joi.array().items(variant).min(1).required(),
  seo: Joi.object().unknown(true),
  isFeatured: Joi.boolean(),
  isActive: Joi.boolean()
};

export const productSchema = Joi.object({
  body: Joi.object(productBody),
  params: Joi.object(),
  query: Joi.object()
});

export const productUpdateSchema = Joi.object({
  body: Joi.object({
    ...productBody,
    title: productBody.title.optional(),
    productType: productBody.productType.optional(),
    category: productBody.category.optional(),
    variants: Joi.array().items(variant).min(1)
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object()
});

export const productListSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    q: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    productType: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(20)
  })
});
