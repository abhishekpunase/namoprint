import { ApiError } from '../utils/apiError.js';

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, _req, res, _next) => {
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    const duplicate = err.keyValue?.[field];
    return res.status(409).json({
      success: false,
      message:
        field === 'slug'
          ? `This URL slug is already in use${duplicate ? ` (${duplicate})` : ''}. Please change the title slightly — a unique slug will be generated automatically.`
          : `Duplicate ${field}${duplicate ? `: ${duplicate}` : ''}. Please use a different value.`,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    details: err.details,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
