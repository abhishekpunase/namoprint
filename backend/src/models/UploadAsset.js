import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 1 },
    height: { type: Number, default: 1 },
    rotate: { type: Number, default: 0 },
    scale: { type: Number, default: 1 }
  },
  { _id: false }
);

const uploadAssetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    originalName: String,
    mimeType: String,
    sizeBytes: Number,
    width: Number,
    height: Number,
    dpiWarning: String,
    storage: { type: String, enum: ['local', 's3'], required: true },
    key: { type: String, required: true },
    url: { type: String, required: true },
    optimizedKey: String,
    optimizedUrl: String,
    crop: { type: cropSchema, default: () => ({}) },
    expiresAt: Date
  },
  { timestamps: true }
);

export const UploadAsset = mongoose.model('UploadAsset', uploadAssetSchema);
export { cropSchema };
