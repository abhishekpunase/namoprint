import { env } from '../config/env.js';
import { StoreSettings } from '../models/StoreSettings.js';

export const SECRET_PLACEHOLDER = '••••••••';

const pickEnvDefaults = () => ({
  key: 'store',
  razorpay: {
    enabled: Boolean(env.razorpay.keyId && env.razorpay.keySecret),
    keyId: env.razorpay.keyId || '',
    keySecret: env.razorpay.keySecret || '',
    webhookSecret: env.razorpay.webhookSecret || '',
  },
  shiprocket: {
    enabled: Boolean(env.shiprocket.email && env.shiprocket.password),
    email: env.shiprocket.email || '',
    password: env.shiprocket.password || '',
    baseUrl: env.shiprocket.baseUrl || 'https://apiv2.shiprocket.in/v1/external',
  },
  mail: {
    enabled: Boolean(env.smtp.host && env.smtp.user && env.smtp.pass),
    host: env.smtp.host || '',
    port: env.smtp.port || 587,
    secure: env.smtp.secure || false,
    user: env.smtp.user || '',
    pass: env.smtp.pass || '',
    from: env.smtp.from || '',
    contactToEmail: env.smtp.from?.match(/<([^>]+)>/)?.[1] || env.smtp.from || 'namoprintsofficial@gmail.com',
  },
  contact: {
    displayEmail: 'namoprintsofficial@gmail.com',
    displayPhone: '+91 90985 70277',
    whatsappNumber: '919098570277',
    address: 'Indore, Madhya Pradesh, India',
  },
});

export async function getStoreSettingsDoc() {
  let doc = await StoreSettings.findOne({ key: 'store' });
  if (!doc) {
    doc = await StoreSettings.create(pickEnvDefaults());
  }
  return doc;
}

function applySecret(current, incoming) {
  if (incoming === undefined || incoming === null) return current;
  const value = String(incoming).trim();
  if (!value || value === SECRET_PLACEHOLDER) return current;
  return value;
}

export async function updateStoreSettings(patch = {}) {
  const doc = await getStoreSettingsDoc();

  if (patch.razorpay) {
    doc.razorpay.enabled = patch.razorpay.enabled ?? doc.razorpay.enabled;
    if (patch.razorpay.keyId !== undefined) doc.razorpay.keyId = String(patch.razorpay.keyId || '').trim();
    doc.razorpay.keySecret = applySecret(doc.razorpay.keySecret, patch.razorpay.keySecret);
    doc.razorpay.webhookSecret = applySecret(doc.razorpay.webhookSecret, patch.razorpay.webhookSecret);
  }

  if (patch.shiprocket) {
    doc.shiprocket.enabled = patch.shiprocket.enabled ?? doc.shiprocket.enabled;
    if (patch.shiprocket.email !== undefined) doc.shiprocket.email = String(patch.shiprocket.email || '').trim();
    doc.shiprocket.password = applySecret(doc.shiprocket.password, patch.shiprocket.password);
    if (patch.shiprocket.baseUrl !== undefined) {
      doc.shiprocket.baseUrl = String(patch.shiprocket.baseUrl || '').trim() || doc.shiprocket.baseUrl;
    }
  }

  if (patch.mail) {
    doc.mail.enabled = patch.mail.enabled ?? doc.mail.enabled;
    if (patch.mail.host !== undefined) doc.mail.host = String(patch.mail.host || '').trim();
    if (patch.mail.port !== undefined) doc.mail.port = Number(patch.mail.port) || 587;
    if (patch.mail.secure !== undefined) doc.mail.secure = Boolean(patch.mail.secure);
    if (patch.mail.user !== undefined) doc.mail.user = String(patch.mail.user || '').trim();
    doc.mail.pass = applySecret(doc.mail.pass, patch.mail.pass);
    if (patch.mail.from !== undefined) doc.mail.from = String(patch.mail.from || '').trim();
    if (patch.mail.contactToEmail !== undefined) {
      doc.mail.contactToEmail = String(patch.mail.contactToEmail || '').trim();
    }
  }

  if (patch.contact) {
    Object.assign(doc.contact, {
      ...(patch.contact.displayEmail !== undefined ? { displayEmail: String(patch.contact.displayEmail).trim() } : {}),
      ...(patch.contact.displayPhone !== undefined ? { displayPhone: String(patch.contact.displayPhone).trim() } : {}),
      ...(patch.contact.whatsappNumber !== undefined ? { whatsappNumber: String(patch.contact.whatsappNumber).trim() } : {}),
      ...(patch.contact.address !== undefined ? { address: String(patch.contact.address).trim() } : {}),
    });
  }

  await doc.save();
  return doc;
}

export async function getRazorpayConfig() {
  const doc = await getStoreSettingsDoc();
  const envFallback = pickEnvDefaults().razorpay;
  return {
    enabled: doc.razorpay.enabled !== false,
    keyId: doc.razorpay.keyId || envFallback.keyId,
    keySecret: doc.razorpay.keySecret || envFallback.keySecret,
    webhookSecret: doc.razorpay.webhookSecret || envFallback.webhookSecret,
  };
}

export async function getShiprocketConfig() {
  const doc = await getStoreSettingsDoc();
  const envFallback = pickEnvDefaults().shiprocket;
  return {
    enabled: doc.shiprocket.enabled !== false,
    email: doc.shiprocket.email || envFallback.email,
    password: doc.shiprocket.password || envFallback.password,
    baseUrl: doc.shiprocket.baseUrl || envFallback.baseUrl,
  };
}

export async function getMailConfig() {
  const doc = await getStoreSettingsDoc();
  const envFallback = pickEnvDefaults().mail;
  const host = doc.mail.host || envFallback.host;
  const user = doc.mail.user || envFallback.user;
  const pass = doc.mail.pass || envFallback.pass;
  const enabled = doc.mail.enabled !== false && Boolean(host && user && pass);
  return {
    enabled,
    host,
    port: doc.mail.port || envFallback.port || 587,
    secure: doc.mail.secure ?? envFallback.secure ?? false,
    user,
    pass,
    from: doc.mail.from || envFallback.from || user,
    contactToEmail: doc.mail.contactToEmail || envFallback.contactToEmail || user,
  };
}

export async function getPublicContactSettings() {
  const doc = await getStoreSettingsDoc();
  const mail = await getMailConfig();
  return {
    displayEmail: doc.contact.displayEmail || mail.contactToEmail || 'namoprintsofficial@gmail.com',
    displayPhone: doc.contact.displayPhone || '+91 90985 70277',
    whatsappNumber: doc.contact.whatsappNumber || '919098570277',
    address: doc.contact.address || 'Indore, Madhya Pradesh, India',
    mailEnabled: mail.enabled,
  };
}

function maskSecret(value) {
  return value ? SECRET_PLACEHOLDER : '';
}

export async function getAdminIntegrationsView() {
  const doc = await getStoreSettingsDoc();
  const mail = await getMailConfig();
  const razorpay = await getRazorpayConfig();
  const shiprocket = await getShiprocketConfig();

  return {
    razorpay: {
      enabled: doc.razorpay.enabled !== false,
      keyId: razorpay.keyId || '',
      keySecret: maskSecret(doc.razorpay.keySecret || env.razorpay.keySecret),
      keySecretSet: Boolean(doc.razorpay.keySecret || env.razorpay.keySecret),
      webhookSecret: maskSecret(doc.razorpay.webhookSecret || env.razorpay.webhookSecret),
      webhookSecretSet: Boolean(doc.razorpay.webhookSecret || env.razorpay.webhookSecret),
      configured: Boolean(razorpay.keyId && razorpay.keySecret),
    },
    shiprocket: {
      enabled: doc.shiprocket.enabled !== false,
      email: shiprocket.email || '',
      password: maskSecret(doc.shiprocket.password || env.shiprocket.password),
      passwordSet: Boolean(doc.shiprocket.password || env.shiprocket.password),
      baseUrl: shiprocket.baseUrl || '',
      configured: Boolean(shiprocket.email && shiprocket.password),
    },
    mail: {
      enabled: doc.mail.enabled !== false,
      host: mail.host || '',
      port: mail.port || 587,
      secure: mail.secure || false,
      user: mail.user || '',
      pass: maskSecret(doc.mail.pass || env.smtp.pass),
      passSet: Boolean(doc.mail.pass || env.smtp.pass),
      from: mail.from || '',
      contactToEmail: mail.contactToEmail || '',
      configured: mail.enabled,
    },
    contact: {
      displayEmail: doc.contact.displayEmail || '',
      displayPhone: doc.contact.displayPhone || '',
      whatsappNumber: doc.contact.whatsappNumber || '',
      address: doc.contact.address || '',
    },
  };
}
