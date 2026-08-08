import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn
  });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), tokenVersion: user.tokenVersion }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });
