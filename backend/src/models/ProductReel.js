import mongoose from 'mongoose';

const productReelSchema = new mongoose.Schema(
  {
    categoryLabel: { type: String, default: 'Acrylic', trim: true },
    productName: { type: String, required: true, trim: true },
    priceLabel: { type: String, default: '', trim: true },
    likesLabel: { type: String, default: '0', trim: true },
    videoUrl: { type: String, required: true, trim: true },
    posterUrl: { type: String, default: '', trim: true },
    linkUrl: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ProductReel = mongoose.model('ProductReel', productReelSchema);
