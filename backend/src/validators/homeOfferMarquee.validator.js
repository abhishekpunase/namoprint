import Joi from 'joi';

const itemBody = {
  text: Joi.string().min(2).max(300).required(),
  sortOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
};

export const homeOfferMarqueeSchema = Joi.object({
  body: Joi.object(itemBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const homeOfferMarqueeUpdateSchema = Joi.object({
  body: Joi.object({
    text: Joi.string().min(2).max(300),
    sortOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean(),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});
