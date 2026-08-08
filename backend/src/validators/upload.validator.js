import Joi from 'joi';

export const previewSchema = Joi.object({
  body: Joi.object({
    productId: Joi.string().required(),
    assetId: Joi.string().required(),
    crop: Joi.object({
      x: Joi.number().default(0),
      y: Joi.number().default(0),
      width: Joi.number().min(0.01).default(1),
      height: Joi.number().min(0.01).default(1),
      rotate: Joi.number().default(0),
      scale: Joi.number().min(0.1).default(1)
    })
  }),
  params: Joi.object(),
  query: Joi.object()
});
