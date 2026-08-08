import Joi from 'joi';
import { ORDER_STATUSES } from '../constants/catalog.js';

const address = Joi.object({
  fullName: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().allow('', null),
  line1: Joi.string().required(),
  line2: Joi.string().allow('', null),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().required(),
  country: Joi.string().default('India')
});

export const checkoutSchema = Joi.object({
  body: Joi.object({
    sessionId: Joi.string().allow('', null),
    customer: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required()
    }).required(),
    shippingAddress: address.required(),
    billingAddress: address,
    specialDate: Joi.date().iso().allow(null, ''),
    specialDateLabel: Joi.string().max(80).allow('', null),
    couponCode: Joi.string().max(32).allow('', null)
  }),
  params: Joi.object(),
  query: Joi.object()
});

export const orderStatusSchema = Joi.object({
  body: Joi.object({
    status: Joi.string()
      .valid(...ORDER_STATUSES)
      .required(),
    note: Joi.string().allow('', null)
  }),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object()
});
