import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'store', unique: true, immutable: true },
    razorpay: {
      enabled: { type: Boolean, default: true },
      keyId: { type: String, default: '', trim: true },
      keySecret: { type: String, default: '', trim: true },
      webhookSecret: { type: String, default: '', trim: true },
    },
    shiprocket: {
      enabled: { type: Boolean, default: true },
      email: { type: String, default: '', trim: true },
      password: { type: String, default: '', trim: true },
      baseUrl: {
        type: String,
        default: 'https://apiv2.shiprocket.in/v1/external',
        trim: true,
      },
    },
    mail: {
      enabled: { type: Boolean, default: false },
      host: { type: String, default: '', trim: true },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      user: { type: String, default: '', trim: true },
      pass: { type: String, default: '', trim: true },
      from: { type: String, default: '', trim: true },
      contactToEmail: { type: String, default: '', trim: true },
    },
    contact: {
      displayEmail: { type: String, default: '', trim: true },
      displayPhone: { type: String, default: '', trim: true },
      whatsappNumber: { type: String, default: '', trim: true },
      address: { type: String, default: '', trim: true },
    },
  },
  { timestamps: true },
);

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
