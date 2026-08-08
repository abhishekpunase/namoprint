import mongoose from 'mongoose';

/**
 * GodOrder
 * --------
 * Lightweight, standalone "quick order / enquiry" capture for the
 * readymade God Photo Frame line. Kept separate from the main
 * Cart -> Order -> Payment pipeline (which is hard-wired to the
 * legacy `Product` model) so nothing there needs to change.
 */
const godOrderSchema = new mongoose.Schema(
  {
    godProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'GodProduct', required: true },
    productTitle: { type: String, required: true }, // snapshot at order time
    qualityLabel: { type: String, required: true }, // snapshot at order time
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String
    },
    notes: String,
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'New'
    }
  },
  { timestamps: true }
);

export const GodOrder = mongoose.model('GodOrder', godOrderSchema);
