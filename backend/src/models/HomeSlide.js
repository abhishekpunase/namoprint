import mongoose from 'mongoose';

const homeSlideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    priceLabel: { type: String, default: '', trim: true },
    backgroundClass: { type: String, default: 'bg-[#FBF0DD]', trim: true },
    imageUrl: { type: String, required: true, trim: true },
    linkUrl: { type: String, default: '/products', trim: true },
    buttonLabel: { type: String, default: 'Shop Now', trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const HomeSlide = mongoose.model('HomeSlide', homeSlideSchema);
