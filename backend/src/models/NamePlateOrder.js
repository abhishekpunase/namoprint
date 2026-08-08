import mongoose from 'mongoose';

/**
 * NamePlateOrder
 * ---------------
 * Captures what the customer wants engraved/printed on their name
 * plate (headingText + subText) along with their chosen quality
 * option and contact details. This is the record that lets the
 * team know exactly how each customer wants their name plate to
 * read. Fully independent of the legacy Cart/Order pipeline.
 */
const namePlateOrderSchema = new mongoose.Schema(
  {
    namePlateProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'NamePlateProduct', required: true },
    productTitle: { type: String, required: true }, // snapshot at order time
    qualityLabel: { type: String, required: true }, // snapshot at order time
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    totalPrice: { type: Number, required: true, min: 0 },

    // The actual text the customer wants on their name plate
    headingText: { type: String, required: true, trim: true },
    subText: { type: String, trim: true },

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

export const NamePlateOrder = mongoose.model('NamePlateOrder', namePlateOrderSchema);
