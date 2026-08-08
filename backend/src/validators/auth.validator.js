import Joi from 'joi';
import { requiredEmail } from './emailField.js';

export const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(80).required(),
    email: requiredEmail(),
    phone: Joi.string().allow('', null),
    password: Joi.string().min(8).max(128).required()
  }),
  params: Joi.object(),
  query: Joi.object()
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: requiredEmail(),
    password: Joi.string().required()
  }),
  params: Joi.object(),
  query: Joi.object()
});

export const adminRegisterSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(80).required(),
    email: requiredEmail(),
    phone: Joi.string().allow('', null),
    password: Joi.string().min(10).max(128).required(),
    setupSecret: Joi.string().required()
  }),
  params: Joi.object(),
  query: Joi.object()
});

export const refreshSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required()
  }),
  params: Joi.object(),
  query: Joi.object()
});

export const forgotPasswordSchema = Joi.object({
  body: Joi.object({
    email: requiredEmail()
  }),
  params: Joi.object(),
  query: Joi.object()
});

export const resetPasswordSchema = Joi.object({
  body: Joi.object({
    token: Joi.string().min(20).required(),
    password: Joi.string().min(8).max(128).required()
  }),
  params: Joi.object(),
  query: Joi.object()
});
