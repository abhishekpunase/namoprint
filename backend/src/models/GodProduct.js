import mongoose from 'mongoose';
import slugify from 'slugify';

/**
 * GodProduct
 * ----------
 * Readymade God / Devotional photo frames.
 * NOTE: This is intentionally a brand-new, standalone collection.
 * It does NOT touch or extend the existing `Product` model so the
 * legacy customization catalog keeps working exactly as before.
 * No personalization/upload fields here on purpose — these are
 * ready-to-ship items, the customer only picks a quality + price option.
 */

const qualityOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "12x18 inch - Standard Acrylic"
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 100, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  { _id: true }
);

const godProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // e.g. "Lord Ganesha Photo Frame"
    slug: { type: String, unique: true, index: true },
    deity: { type: String, trim: true }, // e.g. "Ganesha", "Krishna", "Lakshmi"
    description: String,
    highlights: [String],
    images: { type: [String], default: [] }, // live product image URLs
    qualityOptions: { type: [qualityOptionSchema], default: [] },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
      keywords: [String]
    }
  },
  { timestamps: true }
);

godProductSchema.pre('validate', function makeSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

godProductSchema.index({ title: 'text', deity: 'text', description: 'text' });

export const GodProduct = mongoose.model('GodProduct', godProductSchema);
