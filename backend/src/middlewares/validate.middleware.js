import { ApiError } from '../utils/apiError.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      {
        body: req.body,
        params: req.params,
        query: req.query,
      },
      {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      }
    );

    if (error) {
      return next(
        new ApiError(
          422,
          error.details.map((item) => item.message).join(', ')
        )
      );
    }

    req.body = value.body;
    req.params = value.params;
    req.query = value.query;

    next();
  };
};