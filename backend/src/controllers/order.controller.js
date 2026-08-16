import { nanoid } from 'nanoid';
import path from 'node:path';
import { Cart } from '../models/Cart.js';
import { CorporateGiftProduct } from '../models/CorporateGiftProduct.js';
import { BabyBirthFrameProduct } from '../models/BabyBirthFrameProduct.js';
import { TrophyProduct } from '../models/TrophyProduct.js';
import { PenPrintProduct } from '../models/PenPrintProduct.js';
import { UvDtfStickerProduct } from '../models/UvDtfStickerProduct.js';
import { ProductLabelStickerProduct } from '../models/ProductLabelStickerProduct.js';
import { GodProduct } from '../models/GodProduct.js';
import { NamePlateProduct } from '../models/NamePlateProduct.js';
import { TShirtProduct } from '../models/TShirtProduct.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { UploadAsset } from '../models/UploadAsset.js';
import { User } from '../models/User.js';
import { calculateOrderTotals, validateCouponForUser } from '../services/coupon.service.js';
import { exportOrderItemDesignJpeg, loadImageBuffer, resolveTShirtAssetUrl } from '../services/orderDesign.service.js';
import { createShipmentDraft } from '../services/shipping.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveProductVariantFromCartItem } from '../utils/resolveProductVariant.js';

async function enrichOrderSlotPhotoUrls(orderDoc) {
  if (!orderDoc?.items?.length) return orderDoc;

  const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
  const assetIds = [];

  for (const item of order.items || []) {
    for (const slot of item.customization?.slotPhotos || []) {
      const id = slot?.asset || slot?.assetId;
      if (id && !slot.url) assetIds.push(String(id));
    }
  }

  if (!assetIds.length) return order;

  const uniqueIds = [...new Set(assetIds)];
  const assets = await UploadAsset.find({ _id: { $in: uniqueIds } }).lean();
  const byId = new Map(assets.map((asset) => [String(asset._id), asset]));

  for (const item of order.items || []) {
    const slots = item.customization?.slotPhotos;
    if (!Array.isArray(slots)) continue;
    item.customization.slotPhotos = slots.map((slot) => {
      if (!slot || slot.url) return slot;
      const asset = byId.get(String(slot.asset || slot.assetId));
      if (!asset) return slot;
      return {
        ...slot,
        url: asset.optimizedUrl || asset.url || asset.previewUrl || '',
      };
    });
  }

  return order;
}

const findCheckoutCart = async (req) => {
  return Cart.findOne({ user: req.user._id })
    .populate('items.product')
    .populate('items.godProduct')
    .populate('items.namePlateProduct')
    .populate('items.tShirtProduct')
    .populate('items.corporateGiftProduct')
    .populate('items.babyBirthFrameProduct')
    .populate('items.trophyProduct')
    .populate('items.penPrintProduct')
    .populate('items.uvDtfStickerProduct')
    .populate('items.productLabelStickerProduct');
};

export const createOrderFromCart = asyncHandler(async (req, res) => {
  const cart = await findCheckoutCart(req);
  if (!cart || cart.items.length === 0) throw new ApiError(400, 'Cart is empty');

  const orderItems = [];
  for (const item of cart.items) {
    const isGodItem = item.itemType === 'god' || item.godProduct;
    const isNamePlateItem = item.itemType === 'nameplate' || item.namePlateProduct;
    const isCorporateGiftItem = item.itemType === 'corporategift' || item.corporateGiftProduct;
    const isBabyBirthFrameItem = item.itemType === 'babybirthframe' || item.babyBirthFrameProduct;
    const isTrophyItem = item.itemType === 'trophy' || item.trophyProduct;
    const isPenPrintItem = item.itemType === 'penprint' || item.penPrintProduct;
    const isUvDtfStickerItem = item.itemType === 'uvdtfsticker' || item.uvDtfStickerProduct;
    const isProductLabelStickerItem =
      item.itemType === 'productlabelsticker' || item.productLabelStickerProduct;
    const isTShirtItem = item.itemType === 'tshirt' || item.tShirtProduct;

    if (isGodItem) {
      const godProduct = await GodProduct.findById(item.godProduct?._id || item.godProduct);
      const option = godProduct?.qualityOptions.id(item.qualityOptionId);
      if (!godProduct || !option) throw new ApiError(409, 'Some god frame items are no longer available');
      if (option.stock < item.quantity) {
        throw new ApiError(409, `${godProduct.title} is out of stock`);
      }

      orderItems.push({
        godProduct: godProduct._id,
        title: godProduct.title,
        sku: `GOD-${String(option.label || 'FRAME').replace(/\s+/g, '-').slice(0, 24).toUpperCase()}`,
        variantSnapshot: option.toObject(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: {
          ...(item.customization || {}),
          itemType: 'god',
          qualityLabel: option.label,
        },
      });
      continue;
    }

    if (isNamePlateItem) {
      const namePlateProduct = await NamePlateProduct.findById(item.namePlateProduct?._id || item.namePlateProduct);
      const option = namePlateProduct?.qualityOptions.id(item.qualityOptionId);
      if (!namePlateProduct || !option) throw new ApiError(409, 'Some name plate items are no longer available');
      if (option.stock < item.quantity) {
        throw new ApiError(409, `${namePlateProduct.title} is out of stock`);
      }

      orderItems.push({
        namePlateProduct: namePlateProduct._id,
        title: namePlateProduct.title,
        sku: `NP-${String(option.label || 'PLATE').replace(/\s+/g, '-').slice(0, 24).toUpperCase()}`,
        variantSnapshot: option.toObject(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: {
          ...(item.customization || {}),
          itemType: 'nameplate',
          qualityLabel: option.label,
          headingText: item.customization?.headingText || '',
          subText: item.customization?.subText || '',
        },
      });
      continue;
    }

    if (isCorporateGiftItem) {
      const corporateGiftProduct = await CorporateGiftProduct.findById(
        item.corporateGiftProduct?._id || item.corporateGiftProduct,
      );
      const option = corporateGiftProduct?.qualityOptions.id(item.qualityOptionId);
      if (!corporateGiftProduct || !option) {
        throw new ApiError(409, 'Some corporate gift items are no longer available');
      }
      if (option.stock < item.quantity) {
        throw new ApiError(409, `${corporateGiftProduct.title} is out of stock`);
      }

      orderItems.push({
        corporateGiftProduct: corporateGiftProduct._id,
        title: corporateGiftProduct.title,
        sku: `CG-${String(option.label || 'GIFT').replace(/\s+/g, '-').slice(0, 24).toUpperCase()}`,
        variantSnapshot: option.toObject(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: {
          ...(item.customization || {}),
          itemType: 'corporategift',
          qualityLabel: option.label,
          designFileUrl: item.customization?.designFileUrl || '',
          designFileName: item.customization?.designFileName || '',
        },
      });
      continue;
    }

    if (isBabyBirthFrameItem) {
      const babyBirthFrameProduct = await BabyBirthFrameProduct.findById(
        item.babyBirthFrameProduct?._id || item.babyBirthFrameProduct,
      );
      const option = babyBirthFrameProduct?.qualityOptions.id(item.qualityOptionId);
      if (!babyBirthFrameProduct || !option) {
        throw new ApiError(409, 'Some baby birth frame items are no longer available');
      }
      if (option.stock < item.quantity) {
        throw new ApiError(409, `${babyBirthFrameProduct.title} is out of stock`);
      }

      orderItems.push({
        babyBirthFrameProduct: babyBirthFrameProduct._id,
        title: babyBirthFrameProduct.title,
        sku: `BBF-${String(option.label || 'FRAME').replace(/\s+/g, '-').slice(0, 24).toUpperCase()}`,
        variantSnapshot: option.toObject(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: {
          ...(item.customization || {}),
          itemType: 'babybirthframe',
          qualityLabel: option.label,
          gender: item.customization?.gender || '',
          babyName: item.customization?.babyName || '',
          birthDate: item.customization?.birthDate || '',
          birthTime: item.customization?.birthTime || '',
          weight: item.customization?.weight || '',
          height: item.customization?.height || '',
          hospital: item.customization?.hospital || '',
          proudParents: item.customization?.proudParents || '',
          photoUrls: item.customization?.photoUrls || [],
        },
      });
      continue;
    }

    if (isTrophyItem) {
      const trophyProduct = await TrophyProduct.findById(item.trophyProduct?._id || item.trophyProduct);
      const option = trophyProduct?.qualityOptions.id(item.qualityOptionId);
      if (!trophyProduct || !option) {
        throw new ApiError(409, 'Some trophy items are no longer available');
      }
      if (option.stock < item.quantity) {
        throw new ApiError(409, `${trophyProduct.title} is out of stock`);
      }

      orderItems.push({
        trophyProduct: trophyProduct._id,
        title: trophyProduct.title,
        sku: `TRP-${String(option.label || 'TROPHY').replace(/\s+/g, '-').slice(0, 24).toUpperCase()}`,
        variantSnapshot: option.toObject(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: {
          ...(item.customization || {}),
          itemType: 'trophy',
          qualityLabel: option.label,
          mainHeading: item.customization?.mainHeading || '',
          subHeading: item.customization?.subHeading || '',
          thirdLine: item.customization?.thirdLine || '',
          recipientName: item.customization?.recipientName || '',
          eventName: item.customization?.eventName || '',
          awardDate: item.customization?.awardDate || '',
          organizationName: item.customization?.organizationName || '',
          logoUrl: item.customization?.logoUrl || '',
        },
      });
      continue;
    }

    if (isPenPrintItem) {
      const penPrintProduct = await PenPrintProduct.findById(item.penPrintProduct?._id || item.penPrintProduct);
      const option = penPrintProduct?.qualityOptions.id(item.qualityOptionId);
      if (!penPrintProduct || !option) {
        throw new ApiError(409, 'Some pen print items are no longer available');
      }
      if (option.stock < item.quantity) {
        throw new ApiError(409, `${penPrintProduct.title} is out of stock`);
      }

      orderItems.push({
        penPrintProduct: penPrintProduct._id,
        title: penPrintProduct.title,
        sku: `PEN-${String(option.label || 'PRINT').replace(/\s+/g, '-').slice(0, 24).toUpperCase()}`,
        variantSnapshot: option.toObject(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: {
          ...(item.customization || {}),
          itemType: 'penprint',
          qualityLabel: option.label,
          username: item.customization?.username || '',
        },
      });
      continue;
    }

    if (isUvDtfStickerItem) {
      const uvDtfStickerProduct = await UvDtfStickerProduct.findById(
        item.uvDtfStickerProduct?._id || item.uvDtfStickerProduct,
      );
      const option = uvDtfStickerProduct?.qualityOptions.id(item.qualityOptionId);
      if (!uvDtfStickerProduct || !option) {
        throw new ApiError(409, 'Some UV DTF sticker items are no longer available');
      }
      if (option.stock < item.quantity) {
        throw new ApiError(409, `${uvDtfStickerProduct.title} is out of stock`);
      }

      orderItems.push({
        uvDtfStickerProduct: uvDtfStickerProduct._id,
        title: uvDtfStickerProduct.title,
        sku: `UVDTF-${String(option.label || 'STICKER').replace(/\s+/g, '-').slice(0, 24).toUpperCase()}`,
        variantSnapshot: option.toObject(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: {
          ...(item.customization || {}),
          itemType: 'uvdtfsticker',
          qualityLabel: option.label,
          logoUrl: item.customization?.logoUrl || '',
          logoFileName: item.customization?.logoFileName || '',
        },
      });
      continue;
    }

    if (isProductLabelStickerItem) {
      const productLabelStickerProduct = await ProductLabelStickerProduct.findById(
        item.productLabelStickerProduct?._id || item.productLabelStickerProduct,
      );
      const option = productLabelStickerProduct?.qualityOptions.id(item.qualityOptionId);
      if (!productLabelStickerProduct || !option) {
        throw new ApiError(409, 'Some product label sticker items are no longer available');
      }
      if (option.stock < item.quantity) {
        throw new ApiError(409, `${productLabelStickerProduct.title} is out of stock`);
      }

      orderItems.push({
        productLabelStickerProduct: productLabelStickerProduct._id,
        title: productLabelStickerProduct.title,
        sku: `PLBL-${String(option.label || 'LABEL').replace(/\s+/g, '-').slice(0, 24).toUpperCase()}`,
        variantSnapshot: option.toObject(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: {
          ...(item.customization || {}),
          itemType: 'productlabelsticker',
          qualityLabel: option.label,
          labelImageUrl: item.customization?.labelImageUrl || '',
          labelFileName: item.customization?.labelFileName || '',
        },
      });
      continue;
    }

    if (isTShirtItem) {
      const tShirtProduct = await TShirtProduct.findById(item.tShirtProduct?._id || item.tShirtProduct);
      if (!tShirtProduct) throw new ApiError(409, 'Some t-shirt items are no longer available');
      if (tShirtProduct.stock < item.quantity) {
        throw new ApiError(409, `${tShirtProduct.title} is out of stock`);
      }

      orderItems.push({
        tShirtProduct: tShirtProduct._id,
        title: tShirtProduct.title,
        sku: `TSH-${String(tShirtProduct.slug || 'PRINT').replace(/\s+/g, '-').slice(0, 24).toUpperCase()}`,
        variantSnapshot: { price: tShirtProduct.price, sizes: tShirtProduct.sizes },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: {
          ...(item.customization || {}),
          itemType: 'tshirt',
          sizeQuantities: item.customization?.sizeQuantities || {},
          logoUrl: item.customization?.logoUrl || '',
          notes: item.customization?.notes || '',
          productImageUrl: item.customization?.productImageUrl || tShirtProduct.images?.[0] || '',
          logoAssetId: item.customization?.logoAssetId || '',
        },
      });
      continue;
    }

    const product = await Product.findById(item.product?._id || item.product);
    const variant = product ? resolveProductVariantFromCartItem(product, item) : null;
    if (!product || !variant) {
      throw new ApiError(
        409,
        product
          ? `${product.title} is no longer available in the selected size. Remove it from cart and add again.`
          : 'Some cart items are no longer available',
      );
    }
    if (!variant.isActive) {
      throw new ApiError(409, `${product.title} is no longer available in the selected size.`);
    }
    if (variant.stock < item.quantity) throw new ApiError(409, `${product.title} is out of stock`);

    orderItems.push({
      product: product._id,
      title: product.title,
      sku: variant.sku,
      variantSnapshot: variant.toObject(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      customization: item.customization
    });
  }

  const user = await User.findById(req.user._id);
  const specialDateInput = req.body.specialDate ? new Date(req.body.specialDate) : null;
  const specialDateLabel = req.body.specialDateLabel || user?.specialDateLabel || 'Special Day';

  if (specialDateInput && !Number.isNaN(specialDateInput.getTime())) {
    user.specialDate = specialDateInput;
    user.specialDateLabel = specialDateLabel;
    await user.save();
  }

  const effectiveSpecialDate = specialDateInput || user?.specialDate;

  let coupon = null;
  let couponCode = null;
  if (req.body.couponCode) {
    const validated = await validateCouponForUser({
      code: req.body.couponCode,
      userId: req.user._id,
      items: orderItems,
      subtotal: orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    });
    coupon = validated.coupon;
    couponCode = validated.normalizedCode;
  }

  const totals = calculateOrderTotals(orderItems, { specialDate: effectiveSpecialDate, coupon });

  const order = await Order.create({
    orderNo: `NAMOPRINT-${Date.now()}-${nanoid(5).toUpperCase()}`,
    user: req.user._id,
    customer: req.body.customer,
    shippingAddress: req.body.shippingAddress,
    billingAddress: req.body.billingAddress || req.body.shippingAddress,
    items: orderItems,
    totals,
    couponCode,
    specialDate: effectiveSpecialDate,
    specialDateLabel,
    discountNote: totals.discountReason,
    statusHistory: [{ status: 'Pending Payment', note: 'Order created' }]
  });

  res.status(201).json({ success: true, order });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') filter.user = req.user._id;
  const order = await Order.findOne(filter)
    .populate('items.product')
    .populate('items.tShirtProduct');
  if (!order) throw new ApiError(404, 'Order not found');
  const enriched = await enrichOrderSlotPhotoUrls(order);
  res.json({ success: true, order: enriched });
});

export const listAdminOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort('-createdAt')
    .limit(200)
    .populate('items.product')
    .populate('items.tShirtProduct');
  const enriched = await Promise.all(orders.map((order) => enrichOrderSlotPhotoUrls(order)));
  res.json({ success: true, orders: enriched });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.status = req.body.status;
  order.statusHistory.push({ status: req.body.status, note: req.body.note, changedBy: req.user._id });

  if (req.body.status === 'Shipped') {
    if (!order.shipment?.shipmentId) {
      const shipment = await createShipmentDraft({ order });
      order.shipment = {
        ...(order.shipment || {}),
        ...shipment,
      };
    }
  }

  await order.save();
  res.json({ success: true, order });
});

export const downloadOrderItemDesign = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const item = order.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, 'Order item not found');

  const buffer = await exportOrderItemDesignJpeg({ item, dpi: 300 });
  const safeName = `${order.orderNo}-${item.sku || 'design'}.jpg`.replace(/[^\w.-]+/g, '-');

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  res.setHeader('Cache-Control', 'no-store');
  res.send(buffer);
});

export const downloadOrderItemAsset = asyncHandler(async (req, res) => {
  const assetType = req.params.assetType;
  if (!['product', 'logo'].includes(assetType)) {
    throw new ApiError(400, 'Asset type must be product or logo');
  }

  const order = await Order.findById(req.params.id).populate('items.tShirtProduct');
  if (!order) throw new ApiError(404, 'Order not found');

  const item = order.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, 'Order item not found');

  const url = resolveTShirtAssetUrl(item, assetType);
  if (!url) throw new ApiError(404, `No ${assetType} image found for this item`);

  const buffer = await loadImageBuffer(url);
  const ext = path.extname(String(url).split('?')[0]) || '.jpg';
  const safeName = `${order.orderNo}-${item.sku || 'tshirt'}-${assetType}${ext}`.replace(/[^\w.-]+/g, '-');

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  res.setHeader('Cache-Control', 'no-store');
  res.send(buffer);
});
