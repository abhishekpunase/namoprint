import Joi from 'joi';

const slideBody = {
  title: Joi.string().min(2).max(200).required(),
  subtitle: Joi.string().max(200).allow('', null),
  priceLabel: Joi.string().max(80).allow('', null),
  backgroundClass: Joi.string().max(120).allow('', null),
  imageUrl: Joi.string().min(1).max(2048).required(),
  linkUrl: Joi.string().max(500).allow('', null),
  buttonLabel: Joi.string().max(80).allow('', null),
  sortOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
};

export const homeSlideSchema = Joi.object({
  body: Joi.object(slideBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const homeSlideUpdateSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(2).max(200),
    subtitle: Joi.string().max(200).allow('', null),
    priceLabel: Joi.string().max(80).allow('', null),
    backgroundClass: Joi.string().max(120).allow('', null),
    imageUrl: Joi.string().min(1).max(2048),
    linkUrl: Joi.string().max(500).allow('', null),
    buttonLabel: Joi.string().max(80).allow('', null),
    sortOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean(),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});
