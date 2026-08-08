import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwtAccessSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new ApiError(401, 'Token expired');
    if (err.name === 'JsonWebTokenError') throw new ApiError(401, 'Invalid token');
    throw err;
  }
};

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.signedCookies?.accessToken;

  if (!token) throw new ApiError(401, 'Authentication required');

  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub).select('-passwordHash');
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid session');

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.signedCookies?.accessToken;
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    req.user = await User.findById(payload.sub).select('-passwordHash');
  } catch {
    req.user = undefined;
  }

  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) throw new ApiError(403, 'Forbidden');
  next();
};
