import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { getShiprocketConfig } from './storeSettings.service.js';

const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000;

let cachedToken = { value: null, expiresAt: 0 };
let cachedPickupLocation = null;

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || 'https://apiv2.shiprocket.in/v1/external').replace(/\/+$/, '');
}

function sanitizePhone(value = '') {
  const digits = String(value).replace(/\D/g, '');
  if (digits.length >= 10) return Number(digits.slice(-10));
  return Number(digits || '9999999999');
}

function splitName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first: 'Customer', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function formatOrderDate(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function resolveConfig() {
  const config = await getShiprocketConfig();
  if (!config.enabled) {
    throw new ApiError(503, 'Shiprocket integration is disabled in Admin → Integrations.');
  }
  if (!config.email || !config.password) {
    throw new ApiError(503, 'Shiprocket credentials missing. Add API user email & password in Admin → Integrations.');
  }
  return config;
}

async function getAuthToken(forceRefresh = false) {
  if (!forceRefresh && cachedToken.value && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const config = await resolveConfig();
  const response = await fetch(`${normalizeBaseUrl(config.baseUrl)}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: config.email, password: config.password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.token) {
    const message = data.message || data.error || 'Shiprocket authentication failed';
    throw new ApiError(502, `Shiprocket login failed: ${message}`);
  }

  cachedToken = {
    value: data.token,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };
  return data.token;
}

async function shiprocketRequest(path, { method = 'GET', body, retry = true } = {}) {
  const config = await resolveConfig();
  const token = await getAuthToken();
  const url = `${normalizeBaseUrl(config.baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && retry) {
    cachedToken = { value: null, expiresAt: 0 };
    return shiprocketRequest(path, { method, body, retry: false });
  }

  if (!response.ok) {
    const message =
      data.message ||
      data.error ||
      (Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
      `Shiprocket API error (${response.status})`;
    throw new ApiError(502, message);
  }

  return data;
}

export async function listPickupLocations() {
  const data = await shiprocketRequest('/settings/company/pickup');
  const rows = data?.data?.shipping_address || data?.shipping_address || data?.data || [];
  return Array.isArray(rows) ? rows : [];
}

async function resolvePickupLocation() {
  if (env.shiprocket.pickupLocation) return env.shiprocket.pickupLocation;
  if (cachedPickupLocation) return cachedPickupLocation;

  const locations = await listPickupLocations();
  const primary =
    locations.find((row) => row.is_primary || row.primary) ||
    locations.find((row) => row.status === 1) ||
    locations[0];

  const name = primary?.pickup_location || primary?.name || primary?.nickname;
  if (!name) {
    throw new ApiError(
      503,
      'Shiprocket pickup location not found. Set SHIPROCKET_PICKUP_LOCATION in backend .env to your Shiprocket warehouse name.',
    );
  }

  cachedPickupLocation = name;
  return name;
}

function buildAdhocPayload(order, pickupLocation) {
  const address = order.shippingAddress || order.billingAddress;
  if (!address) {
    throw new ApiError(400, 'Order is missing shipping address for Shiprocket.');
  }

  const customerName = splitName(address.fullName || order.customer?.name || 'Customer');
  const email = address.email || order.customer?.email || 'customer@namoprint.com';
  const phone = sanitizePhone(address.phone || order.customer?.phone);
  const subTotal = Math.max(
    1,
    Math.round((order.totals?.subtotal || 0) - (order.totals?.discount || 0)),
  );
  const paymentMethod = order.payment?.status === 'Paid' ? 'Prepaid' : 'COD';

  const orderItems = (order.items || []).map((item) => ({
    name: String(item.title || 'Custom Product').slice(0, 200),
    sku: String(item.sku || item._id || 'SKU').slice(0, 50),
    units: Number(item.quantity) || 1,
    selling_price: Math.max(1, Math.round(item.unitPrice || subTotal)),
    discount: 0,
    tax: 0,
    hsn: 4911,
  }));

  if (!orderItems.length) {
    orderItems.push({
      name: 'Custom Print Order',
      sku: order.orderNo,
      units: 1,
      selling_price: subTotal,
      discount: 0,
      tax: 0,
      hsn: 4911,
    });
  }

  return {
    order_id: String(order.orderNo).slice(0, 50),
    order_date: formatOrderDate(order.createdAt || new Date()),
    pickup_location: pickupLocation,
    comment: `Namo Print order ${order.orderNo}`,
    billing_customer_name: customerName.first,
    billing_last_name: customerName.last,
    billing_address: address.line1,
    billing_address_2: address.line2 || '',
    billing_city: address.city,
    billing_pincode: Number(String(address.pincode).replace(/\D/g, '').slice(0, 6)) || 452001,
    billing_state: address.state,
    billing_country: address.country || 'India',
    billing_email: email,
    billing_phone: phone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: paymentMethod,
    shipping_charges: Math.round(order.totals?.shipping || 0),
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: Math.round(order.totals?.discount || 0),
    sub_total: subTotal,
    length: env.shiprocket.length,
    breadth: env.shiprocket.breadth,
    height: env.shiprocket.height,
    weight: env.shiprocket.weight,
  };
}

export async function createShiprocketOrder(order) {
  if (order.shipment?.shipmentId) {
    return {
      provider: 'shiprocket',
      shipmentId: order.shipment.shipmentId,
      awbCode: order.shipment.awbCode,
      courierName: order.shipment.courierName,
      trackingUrl: order.shipment.trackingUrl,
      note: 'Order already exists on Shiprocket.',
    };
  }

  const pickupLocation = await resolvePickupLocation();
  const payload = buildAdhocPayload(order, pickupLocation);
  const data = await shiprocketRequest('/orders/create/adhoc', { method: 'POST', body: payload });

  const shipmentId = data.shipment_id ? String(data.shipment_id) : undefined;
  const awbCode = data.awb_code ? String(data.awb_code) : undefined;
  const courierName = data.courier_name || undefined;
  const trackingUrl = awbCode ? `https://shiprocket.co/tracking/${awbCode}` : undefined;

  return {
    provider: 'shiprocket',
    shipmentId,
    awbCode,
    courierName,
    trackingUrl,
    shippedAt: new Date(),
    note: `Shiprocket order created (SR order ${data.order_id || 'n/a'}).`,
    raw: {
      shiprocketOrderId: data.order_id,
      status: data.status,
    },
  };
}

export async function testShiprocketConnection() {
  await getAuthToken(true);
  const pickupLocations = await listPickupLocations();
  const pickupLocation = env.shiprocket.pickupLocation || cachedPickupLocation;

  let resolvedPickup = pickupLocation;
  if (!resolvedPickup && pickupLocations.length) {
    resolvedPickup =
      pickupLocations.find((row) => row.is_primary || row.primary)?.pickup_location ||
      pickupLocations[0]?.pickup_location ||
      pickupLocations[0]?.name;
    if (resolvedPickup) cachedPickupLocation = resolvedPickup;
  }

  return {
    ok: true,
    pickupLocations: pickupLocations.map((row) => ({
      name: row.pickup_location || row.name || row.nickname,
      city: row.city,
      pincode: row.pin_code || row.pincode,
      isPrimary: Boolean(row.is_primary || row.primary),
    })),
    pickupLocation: resolvedPickup || null,
  };
}

export function invalidateShiprocketToken() {
  cachedToken = { value: null, expiresAt: 0 };
  cachedPickupLocation = null;
}
