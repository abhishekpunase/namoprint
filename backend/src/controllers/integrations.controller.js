import { invalidateMailTransporter, sendContactEmail, sendTestEmail } from '../services/mail.service.js';
import { testShiprocketConnection } from '../services/shipping.service.js';
import { invalidateShiprocketToken } from '../services/shiprocket.service.js';
import {
  getAdminIntegrationsView,
  getPublicContactSettings,
  updateStoreSettings,
} from '../services/storeSettings.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPublicSettings = asyncHandler(async (_req, res) => {
  const contact = await getPublicContactSettings();
  res.json({ success: true, contact });
});

export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;
  const result = await sendContactEmail({ name, email, phone, message });
  res.json({
    success: true,
    delivered: result.delivered,
    message: result.delivered
      ? 'Thank you! Your message has been sent.'
      : 'Message received. We will get back to you soon.',
  });
});

export const getAdminIntegrations = asyncHandler(async (_req, res) => {
  const integrations = await getAdminIntegrationsView();
  res.json({ success: true, integrations });
});

export const updateAdminIntegrations = asyncHandler(async (req, res) => {
  await updateStoreSettings(req.body);
  invalidateMailTransporter();
  invalidateShiprocketToken();
  const integrations = await getAdminIntegrationsView();
  res.json({ success: true, integrations, message: 'Integration settings saved.' });
});

export const testAdminShiprocket = asyncHandler(async (_req, res) => {
  const result = await testShiprocketConnection();
  res.json({
    success: true,
    message: result.pickupLocation
      ? `Shiprocket connected. Pickup location: ${result.pickupLocation}`
      : 'Shiprocket connected. Add SHIPROCKET_PICKUP_LOCATION in .env or pick a warehouse in Shiprocket panel.',
    ...result,
  });
});

export const sendAdminTestEmail = asyncHandler(async (req, res) => {
  const result = await sendTestEmail({ to: req.body.to });
  if (!result.delivered) {
    throw new ApiError(503, result.error || 'Email could not be sent. Check SMTP settings.');
  }
  res.json({ success: true, message: `Test email sent to ${req.body.to}.` });
});
