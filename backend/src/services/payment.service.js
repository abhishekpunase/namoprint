import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { getRazorpayConfig } from './storeSettings.service.js';
import { ApiError } from '../utils/apiError.js';

export const createRazorpayOrder = async ({ amount, receipt }) => {
  const config = await getRazorpayConfig();
  if (!config.enabled || !config.keyId || !config.keySecret) {
    throw new ApiError(503, 'Razorpay is not configured. Add keys in Admin → Integrations.');
  }

  const razorpay = new Razorpay({ key_id: config.keyId, key_secret: config.keySecret });
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
    payment_capture: 1,
  });
};

export const verifyRazorpaySignature = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const config = await getRazorpayConfig();
  if (!config.keySecret) return false;

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac('sha256', config.keySecret).update(body).digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(razorpaySignature);
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
};

export const verifyWebhookSignature = async ({ rawBody, signature }) => {
  const config = await getRazorpayConfig();
  if (!config.webhookSecret) return false;

  const expected = crypto.createHmac('sha256', config.webhookSecret).update(rawBody).digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
};

export const getPublicRazorpayKeyId = async () => {
  const config = await getRazorpayConfig();
  return config.enabled ? config.keyId : '';
};
