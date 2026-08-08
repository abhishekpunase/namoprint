import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ['product', 'god', 'nameplate', 'tshirt', 'corporategift', 'babybirthframe', 'trophy', 'penprint', 'uvdtfsticker', 'productlabelsticker'],
      default: 'product',
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variantId: { type: mongoose.Schema.Types.ObjectId },
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
    qualityOptionId: { type: mongoose.Schema.Types.ObjectId },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    customization: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

cartItemSchema.pre('validate', function validateCartItem(next) {
  const isGod = this.itemType === 'god' || this.godProduct;
  if (isGod) {
    if (!this.godProduct || !this.qualityOptionId) {
      return next(new Error('God cart item requires godProduct and qualityOptionId'));
    }
    return next();
  }

  const isNamePlate = this.itemType === 'nameplate' || this.namePlateProduct;
  if (isNamePlate) {
    if (!this.namePlateProduct || !this.qualityOptionId) {
      return next(new Error('Name plate cart item requires namePlateProduct and qualityOptionId'));
    }
    return next();
  }

  const isTShirt = this.itemType === 'tshirt' || this.tShirtProduct;
  if (isTShirt) {
    if (!this.tShirtProduct) {
      return next(new Error('T-shirt cart item requires tShirtProduct'));
    }
    return next();
  }

  const isCorporateGift = this.itemType === 'corporategift' || this.corporateGiftProduct;
  if (isCorporateGift) {
    if (!this.corporateGiftProduct || !this.qualityOptionId) {
      return next(new Error('Corporate gift cart item requires corporateGiftProduct and qualityOptionId'));
    }
    return next();
  }

  const isBabyBirthFrame = this.itemType === 'babybirthframe' || this.babyBirthFrameProduct;
  if (isBabyBirthFrame) {
    if (!this.babyBirthFrameProduct || !this.qualityOptionId) {
      return next(new Error('Baby birth frame cart item requires babyBirthFrameProduct and qualityOptionId'));
    }
    return next();
  }

  const isTrophy = this.itemType === 'trophy' || this.trophyProduct;
  if (isTrophy) {
    if (!this.trophyProduct || !this.qualityOptionId) {
      return next(new Error('Trophy cart item requires trophyProduct and qualityOptionId'));
    }
    return next();
  }

  const isPenPrint = this.itemType === 'penprint' || this.penPrintProduct;
  if (isPenPrint) {
    if (!this.penPrintProduct || !this.qualityOptionId) {
      return next(new Error('Pen print cart item requires penPrintProduct and qualityOptionId'));
    }
    return next();
  }

  const isUvDtfSticker = this.itemType === 'uvdtfsticker' || this.uvDtfStickerProduct;
  if (isUvDtfSticker) {
    if (!this.uvDtfStickerProduct || !this.qualityOptionId) {
      return next(new Error('UV DTF sticker cart item requires uvDtfStickerProduct and qualityOptionId'));
    }
    return next();
  }

  const isProductLabelSticker =
    this.itemType === 'productlabelsticker' || this.productLabelStickerProduct;
  if (isProductLabelSticker) {
    if (!this.productLabelStickerProduct || !this.qualityOptionId) {
      return next(
        new Error('Product label sticker cart item requires productLabelStickerProduct and qualityOptionId'),
      );
    }
    return next();
  }

  if (!this.product || !this.variantId) {
    return next(new Error('Cart item requires product and variantId'));
  }
  next();
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true },
    items: [cartItemSchema],
    couponCode: String
  },
  { timestamps: true }
);

export const Cart = mongoose.model('Cart', cartSchema);
