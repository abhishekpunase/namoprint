import mongoose from 'mongoose';

const productReviewSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    productTitle: { type: String, default: '', trim: true },
    productSlug: { type: String, default: '', trim: true, index: true },
    productType: {
      type: String,
      default: 'general',
      trim: true,
      enum: ['general', 'product', 'god-product', 'nameplate', 'tshirt', 'wall-watch', 'corporate-gift'],
    },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    title: { type: String, default: '', trim: true },
    reviewText: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ProductReview = mongoose.model('ProductReview', productReviewSchema);
