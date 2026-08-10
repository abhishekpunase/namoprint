import { env } from '../config/env.js';
import { StoreSettings } from '../models/StoreSettings.js';

export async function ensureStoreSettings() {
  const defaults = {
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
  };

  let doc = await StoreSettings.findOne({ key: 'store' });
  if (!doc) {
    await StoreSettings.create(defaults);
    console.log('Store integrations settings seeded from environment.');
    return;
  }

  let changed = false;
  if (env.shiprocket.email && env.shiprocket.password) {
    if (!doc.shiprocket.email) {
      doc.shiprocket.email = env.shiprocket.email;
      changed = true;
    }
    if (!doc.shiprocket.password) {
      doc.shiprocket.password = env.shiprocket.password;
      changed = true;
    }
    if (doc.shiprocket.enabled === false) {
      doc.shiprocket.enabled = true;
      changed = true;
    }
  }
  if (changed) {
    await doc.save();
    console.log('Shiprocket credentials synced from environment.');
  }
}
