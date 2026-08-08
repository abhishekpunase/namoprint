import Joi from 'joi';

export const productSeoSchema = Joi.object({
  title: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  keywords: Joi.array().items(Joi.string())
});
