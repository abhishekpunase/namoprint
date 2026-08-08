import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  body: Joi.object({
    orderId: Joi.string().required()
  }),
  params: Joi.object(),
  query: Joi.object()
});

export const verifyPaymentSchema = Joi.object({
  body: Joi.object({
    orderId: Joi.string().required(),
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required()
  }),
  params: Joi.object(),
  query: Joi.object()
});
