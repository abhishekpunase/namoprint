import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signAccessToken, signRefreshToken } from '../utils/tokens.js';
import { sendPasswordResetEmail } from '../services/mail.service.js';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  addresses: user.addresses,
  specialDate: user.specialDate,
  specialDateLabel: user.specialDateLabel,
});

export const register = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const exists = await User.exists({ email });
  if (exists) throw new ApiError(409, 'Email already registered');

  const user = new User({ ...req.body, email });
  user.password = req.body.password;
  await user.save();

  res.status(201).json({
    success: true,
    user: publicUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'Account is disabled');

  res.json({
    success: true,
    user: publicUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user)
  });
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email, role: 'admin' }).select('+passwordHash');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Invalid admin email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'Admin account is disabled');

  res.json({
    success: true,
    user: publicUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user)
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

export const registerAdmin = asyncHandler(async (req, res) => {
  if (!env.adminSetupSecret || req.body.setupSecret !== env.adminSetupSecret) {
    throw new ApiError(403, 'Invalid admin setup secret');
  }

  const exists = await User.exists({ email: req.body.email });
  if (exists) throw new ApiError(409, 'Email already registered');

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    role: 'admin'
  });
  user.password = req.body.password;
  await user.save();

  res.status(201).json({
    success: true,
    user: publicUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user)
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  let payload;
  try {
    payload = jwt.verify(req.body.refreshToken, env.jwtRefreshSecret);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }
  const user = await User.findById(payload.sub);

  if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  res.json({
    success: true,
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user: publicUser(user)
  });
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
  res.json({ success: true, message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select(
    '+passwordResetTokenHash +passwordResetExpiresAt'
  );

  const genericResponse = {
    success: true,
    message: 'If this email is registered, a password reset link has been sent.'
  };

  if (!user || !user.isActive) {
    res.json(genericResponse);
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const resetUrl = `${env.passwordResetUrl}?token=${token}`;

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const mail = await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl
  });

  res.json({
    ...genericResponse,
    devResetToken: mail.devOnly ? token : undefined,
    devResetUrl: mail.devOnly ? resetUrl : undefined
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() }
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt');

  if (!user || !user.isActive) throw new ApiError(400, 'Invalid or expired password reset token');

  user.password = req.body.password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  user.tokenVersion += 1;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully. Please login again.' });
});
