import mongoose from 'mongoose';
import slugify from 'slugify';
import { PRODUCT_TYPES } from '../constants/catalog.js';

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    size: { type: String, required: true },
    material: { type: String, default: 'Acrylic' },
    frameType: { type: String, default: 'None' },
    borderType: String,
    printArea: {
      widthMm: Number,
      heightMm: Number,
      bleedMm: { type: Number, default: 3 },
      minDpi: { type: Number, default: 200 }
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  { _id: true }
);

const mockupSchema = new mongoose.Schema(
  {
    baseImageUrl: String,
    overlayImageUrl: String,
    // The frame/mockup PNG shown over the customer's uploaded photo in the
    // product designer (e.g. an acrylic frame, wall photo mockup, clock face).
    // This is what admin uploads from the Admin > Products screen.
    frameImage: String,
    photoBox: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number, default: 1 },
      height: { type: Number, default: 1 },
      rotate: { type: Number, default: 0 },
      borderRadius: { type: Number, default: 0 },
      clipPath: String
    },
    // Optional independent photo windows for collage-style mockups
    // (e.g. Photo Collage Frame, 4-photo clock) — each entry uses the
    // same pixel units as canvas.width/canvas.height.
    photoBoxes: {
      type: [
        {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
          rotate: { type: Number, default: 0 },
          borderRadius: { type: Number, default: 0 },
          clipPath: String
        }
      ],
      default: undefined
    },
    canvas: {
      width: { type: Number, default: 1000 },
      height: { type: Number, default: 1000 }
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    productType: { type: String, enum: PRODUCT_TYPES, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    description: String,
    highlights: [String],
    /** Listing image for home/catalog cards — separate from mockup.frameImage */
    thumbnail: String,
    images: [String],
    // Listing/card image for home page and catalog — separate from mockup.frameImage
    thumbnail: String,
    attributes: {
      size: [String],
      material: [String],
      frameType: [String],
      finish: [String],
      theme: [String]
    },
    personalization: {
      allowPhotoUpload: { type: Boolean, default: true },
      maxPhotos: { type: Number, default: 1 },
      allowText: { type: Boolean, default: false },
      textFields: [String],
      instructions: String
    },
    mockup: mockupSchema,
    defaultOptions: { type: mongoose.Schema.Types.Mixed, default: {} },
    customizationGroups: [
      {
        key: String,
        label: String,
        values: [String],
      },
    ],
    customizationTabs: [String],
    variants: [variantSchema],
    seo: {
      title: String,
      description: String,
      keywords: [String]
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.pre('validate', function makeSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

productSchema.index({ title: 'text', description: 'text', productType: 'text' });

export const Product = mongoose.model('Product', productSchema);
