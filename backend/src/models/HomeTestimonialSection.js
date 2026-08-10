import mongoose from 'mongoose';

const homeTestimonialSectionSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true, immutable: true },
    badge: { type: String, default: 'Customer Testimonials', trim: true },
    heading: {
      type: String,
      default: 'What Our Happy Customers\nSay About Namo Print',
      trim: true,
    },
    subtitle: {
      type: String,
      default:
        'Thousands of customers trust Namo Print for premium quality customized products, fast delivery and excellent customer support.',
      trim: true,
    },
  },
  { timestamps: true },
);

export const HomeTestimonialSection = mongoose.model(
  'HomeTestimonialSection',
  homeTestimonialSectionSchema,
);
