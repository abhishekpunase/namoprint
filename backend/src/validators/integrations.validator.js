import Joi from 'joi';
import { optionalEmail, requiredEmail } from './emailField.js';

const secretField = Joi.string().max(512).allow('', null);

export const integrationsUpdateSchema = Joi.object({
  body: Joi.object({
    razorpay: Joi.object({
      enabled: Joi.boolean(),
      keyId: Joi.string().max(120).allow('', null),
      keySecret: secretField,
      webhookSecret: secretField,
    }),
    shiprocket: Joi.object({
      enabled: Joi.boolean(),
      email: optionalEmail(),
      password: secretField,
      baseUrl: Joi.string().max(500).allow('', null),
    }),
    mail: Joi.object({
      enabled: Joi.boolean(),
      host: Joi.string().max(200).allow('', null),
      port: Joi.number().integer().min(1).max(65535),
      secure: Joi.boolean(),
      user: Joi.string().max(200).allow('', null),
      pass: secretField,
      from: Joi.string().max(200).allow('', null),
      contactToEmail: optionalEmail(),
    }),
    contact: Joi.object({
      displayEmail: optionalEmail(),
      displayPhone: Joi.string().max(40).allow('', null),
      whatsappNumber: Joi.string().max(20).allow('', null),
      address: Joi.string().max(300).allow('', null),
    }),
  }).min(1),
  params: Joi.object(),
  query: Joi.object(),
});

export const contactFormSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    email: requiredEmail(),
    phone: Joi.string().max(20).allow('', null),
    message: Joi.string().min(10).max(5000).required(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

export const testEmailSchema = Joi.object({
  body: Joi.object({
    to: requiredEmail(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});
