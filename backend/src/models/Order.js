import mongoose from 'mongoose';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../constants/catalog.js';
import { addressSchema } from './User.js';

const moneySchema = new mongoose.Schema(
  {
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' }
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    godProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'GodProduct' },
    namePlateProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'NamePlateProduct' },
    tShirtProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'TShirtProduct' },
    corporateGiftProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'CorporateGiftProduct' },
    babyBirthFrameProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'BabyBirthFrameProduct' },
    trophyProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'TrophyProduct' },
    penPrintProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'PenPrintProduct' },
    uvDtfStickerProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'UvDtfStickerProduct' },
    productLabelStickerProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductLabelStickerProduct',
    },
    title: String,
    sku: String,
    variantSnapshot: mongoose.Schema.Types.Mixed,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    customization: mongoose.Schema.Types.Mixed,
    productionFileUrl: String,
    productionFileKey: String
  },
  { _id: true }
);

orderItemSchema.pre('validate', function validateOrderItem(next) {
  if (
    !this.product &&
    !this.godProduct &&
    !this.namePlateProduct &&
    !this.tShirtProduct &&
    !this.corporateGiftProduct &&
    !this.babyBirthFrameProduct &&
    !this.trophyProduct &&
    !this.penPrintProduct &&
    !this.uvDtfStickerProduct &&
    !this.productLabelStickerProduct
  ) {
    return next(
      new Error(
        'Order item requires product, godProduct, namePlateProduct, tShirtProduct, corporateGiftProduct, babyBirthFrameProduct, trophyProduct, penPrintProduct, uvDtfStickerProduct, or productLabelStickerProduct',
      ),
    );
  }
  next();
});

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: {
      name: String,
      email: String,
      phone: String
    },
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    items: [orderItemSchema],
    totals: moneySchema,
    couponCode: String,
    specialDate: Date,
    specialDateLabel: String,
    discountNote: String,
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending Payment' },
    payment: {
      provider: { type: String, default: 'razorpay' },
      status: { type: String, enum: PAYMENT_STATUSES, default: 'Pending' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date
    },
    shipment: {
      provider: String,
      shipmentId: String,
      awbCode: String,
      courierName: String,
      trackingUrl: String,
      shippedAt: Date,
      deliveredAt: Date
    },
    adminNotes: String,
    statusHistory: [
      {
        status: String,
        note: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
