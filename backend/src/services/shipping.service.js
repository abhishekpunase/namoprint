import { getShiprocketConfig } from './storeSettings.service.js';

export const isShiprocketConfigured = async () => {
  const config = await getShiprocketConfig();
  return config.enabled && Boolean(config.email && config.password);
};

export const createShipmentDraft = async ({ order }) => {
  const configured = await isShiprocketConfigured();
  if (!configured) {
    return {
      provider: 'manual',
      trackingUrl: undefined,
      note: 'Shiprocket credentials not configured. Add them in Admin → Integrations.',
    };
  }

  const config = await getShiprocketConfig();
  return {
    provider: 'shiprocket',
    note: `Ready to push order ${order.orderNo} to Shiprocket (${config.email}).`,
  };
};
