import Joi from 'joi';

const testimonialBody = {
  name: Joi.string().min(2).max(120).required(),
  role: Joi.string().max(80).allow('', null),
  imageUrl: Joi.string().min(1).max(2048).required(),
  title: Joi.string().min(2).max(200).required(),
  review: Joi.string().min(10).max(2000).required(),
  rating: Joi.number().integer().min(1).max(5),
  sortOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
};

export const homeTestimonialSchema = Joi.object({
  body: Joi.object(testimonialBody),
  params: Joi.object(),
  query: Joi.object(),
});

export const homeTestimonialUpdateSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(120),
    role: Joi.string().max(80).allow('', null),
    imageUrl: Joi.string().min(1).max(2048),
    title: Joi.string().min(2).max(200),
    review: Joi.string().min(10).max(2000),
    rating: Joi.number().integer().min(1).max(5),
    sortOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean(),
  }).min(1),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object(),
});

export const homeTestimonialSectionSchema = Joi.object({
  body: Joi.object({
    badge: Joi.string().max(120).allow('', null),
    heading: Joi.string().max(300).allow('', null),
    subtitle: Joi.string().max(500).allow('', null),
  }).min(1),
  params: Joi.object(),
  query: Joi.object(),
});
