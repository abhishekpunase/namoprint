import { ApiError } from '../utils/apiError.js';
import { createShiprocketOrder, testShiprocketConnection } from './shiprocket.service.js';
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

  try {
    return await createShiprocketOrder(order);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, err.message || 'Failed to create Shiprocket shipment');
  }
};

export { testShiprocketConnection };
