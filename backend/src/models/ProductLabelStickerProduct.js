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

const productLabelStickerProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: String,
    highlights: [String],
    images: { type: [String], default: [] },
    qualityOptions: { type: [qualityOptionSchema], default: [] },
    labelUploadHint: {
      type: String,
      default: 'Upload your product label image in the exact size you selected above',
    },
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

productLabelStickerProductSchema.pre('validate', function makeSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

productLabelStickerProductSchema.index({ title: 'text', description: 'text' });

export const ProductLabelStickerProduct = mongoose.model(
  'ProductLabelStickerProduct',
  productLabelStickerProductSchema,
);
