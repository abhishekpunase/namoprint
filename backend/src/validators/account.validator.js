import Joi from 'joi';

const address = Joi.object({
  fullName: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().allow('', null),
  line1: Joi.string().required(),
  line2: Joi.string().allow('', null),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().required(),
  country: Joi.string().default('India'),
  isDefault: Joi.boolean().default(false)
});

export const profileSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(80),
    phone: Joi.string().allow('', null)
  }).min(1),
  params: Joi.object(),
  query: Joi.object()
});

export const addressSchema = Joi.object({
  body: address,
  params: Joi.object(),
  query: Joi.object()
});
