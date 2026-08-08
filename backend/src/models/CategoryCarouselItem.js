import mongoose from 'mongoose';

const categoryCarouselItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    productType: { type: String, required: true, trim: true },
    videoUrl: { type: String, default: '', trim: true },
    posterUrl: { type: String, required: true, trim: true },
    linkUrl: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const CategoryCarouselItem = mongoose.model('CategoryCarouselItem', categoryCarouselItemSchema);
