import Joi from 'joi';

const itemBody = {
  label: Joi.string().min(2).max(120).required(),
  productType: Joi.string().min(2).max(120).required(),
  videoUrl: Joi.string().max(2048).allow('', null),
  posterUrl: Joi.string().min(1).max(2048).required(),
  linkUrl: Joi.string().max(500).allow('', null),
  sortOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
};

export const categoryCarouselSchema = Joi.object({
  body: Joi.object(itemBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const categoryCarouselUpdateSchema = Joi.object({
  body: Joi.object({
    label: Joi.string().min(2).max(120),
    productType: Joi.string().min(2).max(120),
    videoUrl: Joi.string().max(2048).allow('', null),
    posterUrl: Joi.string().min(1).max(2048),
    linkUrl: Joi.string().max(500).allow('', null),
    sortOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean(),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});
