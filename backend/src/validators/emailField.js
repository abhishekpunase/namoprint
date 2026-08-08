import Joi from 'joi';

/** Accepts dev/local emails (e.g. admin@omgs.local) — Joi default TLD list rejects .local */
export const requiredEmail = () =>
  Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required();

export const optionalEmail = () =>
  Joi.string().trim().lowercase().email({ tlds: { allow: false } }).allow('', null);
