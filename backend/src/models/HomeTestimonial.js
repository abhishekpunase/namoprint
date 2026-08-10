import mongoose from 'mongoose';

const homeTestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: 'Verified Customer', trim: true },
    imageUrl: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    review: { type: String, required: true, trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const HomeTestimonial = mongoose.model('HomeTestimonial', homeTestimonialSchema);
