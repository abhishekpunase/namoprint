import mongoose from 'mongoose';
import slugify from 'slugify';

const tShirtProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: String,
    longDescription: String,
    highlights: [String],
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    sizes: { type: [String], default: ['S', 'M', 'L', 'XL', 'XXL'] },
    stock: { type: Number, default: 500, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
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

tShirtProductSchema.pre('validate', function makeSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

tShirtProductSchema.index({ title: 'text', description: 'text' });

export const TShirtProduct = mongoose.model('TShirtProduct', tShirtProductSchema);
