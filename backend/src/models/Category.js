import mongoose from 'mongoose';
import slugify from 'slugify';
import { PRODUCT_TYPES } from '../constants/catalog.js';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    productType: { type: String, enum: PRODUCT_TYPES, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    description: String,
    imageUrl: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

categorySchema.pre('validate', function makeSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

export const Category = mongoose.model('Category', categorySchema);
