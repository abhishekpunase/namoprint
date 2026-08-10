import Joi from 'joi';

export const adminListSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    q: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(20)
  })
});

export const userStatusSchema = Joi.object({
  body: Joi.object({
    isActive: Joi.boolean().required()
  }),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object()
});
