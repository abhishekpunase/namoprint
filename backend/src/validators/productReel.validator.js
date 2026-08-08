import Joi from 'joi';

const reelBody = {
  categoryLabel: Joi.string().max(80).allow('', null),
  productName: Joi.string().min(2).max(120).required(),
  priceLabel: Joi.string().max(40).allow('', null),
  likesLabel: Joi.string().max(20).allow('', null),
  videoUrl: Joi.string().min(1).max(2048).required(),
  posterUrl: Joi.string().max(2048).allow('', null),
  linkUrl: Joi.string().max(500).allow('', null),
  sortOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
};

export const productReelSchema = Joi.object({
  body: Joi.object(reelBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const productReelUpdateSchema = Joi.object({
  body: Joi.object({
    categoryLabel: Joi.string().max(80).allow('', null),
    productName: Joi.string().min(2).max(120),
    priceLabel: Joi.string().max(40).allow('', null),
    likesLabel: Joi.string().max(20).allow('', null),
    videoUrl: Joi.string().min(1).max(2048),
    posterUrl: Joi.string().max(2048).allow('', null),
    linkUrl: Joi.string().max(500).allow('', null),
    sortOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean(),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});
