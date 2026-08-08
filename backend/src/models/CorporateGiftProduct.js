import mongoose from 'mongoose';
import slugify from 'slugify';

const qualityOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 100, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true },
);

const corporateGiftProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: String,
    highlights: [String],
    images: { type: [String], default: [] },
    qualityOptions: { type: [qualityOptionSchema], default: [] },
    minOrderQty: { type: Number, default: 1, min: 1 },
    bulkOrderNote: {
      type: String,
      default: 'Order 50+ items and get 15% OFF. Contact us for custom branding.',
    },
    ratingScore: { type: Number, default: 4.8, min: 0, max: 5 },
    reviewCountLabel: { type: String, default: '120+ Reviews' },
    whatsappNumber: { type: String, default: '919098570277' },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true },
);

corporateGiftProductSchema.pre('validate', function makeSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

corporateGiftProductSchema.index({ title: 'text', description: 'text' });

export const CorporateGiftProduct = mongoose.model('CorporateGiftProduct', corporateGiftProductSchema);
