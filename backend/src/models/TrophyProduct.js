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

const trophyProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    subtitle: { type: String, default: 'Celebrate Achievement' },
    description: String,
    highlights: [String],
    images: { type: [String], default: [] },
    qualityOptions: { type: [qualityOptionSchema], default: [] },
    fieldPlaceholders: {
      mainHeading: { type: String, default: 'e.g. Employee of the Year' },
      subHeading: { type: String, default: 'e.g. Outstanding Performance' },
      thirdLine: { type: String, default: 'e.g. Presented with gratitude' },
      recipientName: { type: String, default: 'Enter winner name' },
      eventName: { type: String, default: 'e.g. Annual Awards Night' },
      awardDate: { type: String, default: 'dd-mm-yyyy' },
      organizationName: { type: String, default: 'e.g. Company / Club name' },
    },
    allowLogoUpload: { type: Boolean, default: true },
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

trophyProductSchema.pre('validate', function makeSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

trophyProductSchema.index({ title: 'text', description: 'text' });

export const TrophyProduct = mongoose.model('TrophyProduct', trophyProductSchema);
