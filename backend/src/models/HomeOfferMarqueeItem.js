import mongoose from 'mongoose';

const homeOfferMarqueeItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const HomeOfferMarqueeItem = mongoose.model('HomeOfferMarqueeItem', homeOfferMarqueeItemSchema);
