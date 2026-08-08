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

const babyBirthFrameProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    subtitle: { type: String, default: 'A Memory for Life' },
    description: String,
    highlights: [String],
    images: { type: [String], default: [] },
    qualityOptions: { type: [qualityOptionSchema], default: [] },
    maxPhotos: { type: Number, default: 3, min: 1, max: 10 },
    genderOptions: { type: [String], default: ['Boy', 'Girl'] },
    fieldPlaceholders: {
      babyName: { type: String, default: "Enter baby's name" },
      birthDate: { type: String, default: 'dd-mm-yyyy' },
      birthTime: { type: String, default: '--:--' },
      weight: { type: String, default: 'e.g., 3.2 kg' },
      height: { type: String, default: 'e.g., 50 cm' },
      hospital: { type: String, default: 'Enter hospital name' },
      proudParents: { type: String, default: 'e.g., Mom & Dad Name' },
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

babyBirthFrameProductSchema.pre('validate', function makeSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

babyBirthFrameProductSchema.index({ title: 'text', description: 'text' });

export const BabyBirthFrameProduct = mongoose.model('BabyBirthFrameProduct', babyBirthFrameProductSchema);
