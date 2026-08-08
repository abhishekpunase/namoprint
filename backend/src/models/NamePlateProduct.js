import mongoose from 'mongoose';
import slugify from 'slugify';

/**
 * NamePlateProduct
 * -----------------
 * Standalone catalog for "Name Plate" products. Kept fully separate
 * from the existing `Product` model. On the product page the
 * customer types a heading (main name) and a sub-text (e.g. house
 * name / designation / family names) — this is captured on the
 * NamePlateOrder document below, not on the product itself.
 */

const qualityOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "12x5 inch - Golden Acrylic"
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 100, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  { _id: true }
);

const namePlateProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // e.g. "Classic Golden Acrylic Name Plate"
    slug: { type: String, unique: true, index: true },
    description: String,
    highlights: [String],
    images: { type: [String], default: [] },
    qualityOptions: { type: [qualityOptionSchema], default: [] },
    headingPlaceholder: { type: String, default: 'e.g. The Sharma Family' },
    subTextPlaceholder: { type: String, default: 'e.g. House No. 24, Green Park' },
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

namePlateProductSchema.pre('validate', function makeSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

namePlateProductSchema.index({ title: 'text', description: 'text' });

export const NamePlateProduct = mongoose.model('NamePlateProduct', namePlateProductSchema);
