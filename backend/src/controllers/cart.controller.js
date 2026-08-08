import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
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
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveProductVariant } from '../utils/resolveProductVariant.js';

const populateCartItems = (query) =>
  query
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

const findCart = async (req) => {
  const sessionId = req.headers['x-cart-session'] || req.query.sessionId || nanoid(24);
  const query = req.user ? { user: req.user._id } : { sessionId };
  let cart = await populateCartItems(Cart.findOne(query));
  if (!cart) cart = await Cart.create(query);
  return cart;
};

const buildProductCartItem = async (incoming) => {
  if (!mongoose.Types.ObjectId.isValid(incoming.productId)) {
    throw new ApiError(400, 'Invalid product. Please refresh the page and try again.');
  }

  const product = await Product.findById(incoming.productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const customization = incoming.customization || {};
  const options = customization.options || {};
  const variant = resolveProductVariant(product, incoming.variantId, {
    sku: customization.variantSku,
    size: customization.size || options.size,
    material: customization.material || options.material,
    frameType: customization.frameType || options.frameType,
  });
  if (!variant || !variant.isActive) {
    throw new ApiError(404, 'Variant not found. Refresh the product page and add to cart again.');
  }
  if (variant.stock < incoming.quantity) {
    throw new ApiError(409, `${product.title} is out of stock`);
  }

  return {
    itemType: 'product',
    product: product._id,
    variantId: variant._id,
    quantity: incoming.quantity,
    unitPrice: variant.price,
    customization: incoming.customization || {},
  };
};

const buildGodCartItem = async (incoming) => {
  if (!mongoose.Types.ObjectId.isValid(incoming.godProductId)) {
    throw new ApiError(400, 'Invalid god photo frame. Please refresh and try again.');
  }

  const product = await GodProduct.findById(incoming.godProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'God photo frame not found');

  const option = product.qualityOptions.id(incoming.qualityOptionId);
  if (!option || !option.isActive) throw new ApiError(404, 'Selected quality option not found');
  if (option.stock < incoming.quantity) {
    throw new ApiError(409, `${product.title} is out of stock for the selected size`);
  }

  return {
    itemType: 'god',
    godProduct: product._id,
    qualityOptionId: option._id,
    quantity: incoming.quantity,
    unitPrice: option.price,
    customization: {
      itemType: 'god',
      qualityLabel: option.label,
      previewUrl: product.images?.[0] || '',
    },
  };
};

const buildNamePlateCartItem = async (incoming) => {
  if (!mongoose.Types.ObjectId.isValid(incoming.namePlateProductId)) {
    throw new ApiError(400, 'Invalid name plate. Please refresh and try again.');
  }

  const product = await NamePlateProduct.findById(incoming.namePlateProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'Name plate not found');

  const option = product.qualityOptions.id(incoming.qualityOptionId);
  if (!option || !option.isActive) throw new ApiError(404, 'Selected quality option not found');
  if (option.stock < incoming.quantity) {
    throw new ApiError(409, `${product.title} is out of stock for the selected size`);
  }

  const customization = incoming.customization || {};
  const headingText = String(customization.headingText || '').trim();
  const subText = String(customization.subText || '').trim();
  if (!headingText || !subText) {
    throw new ApiError(400, 'Please enter both name and address for the name plate.');
  }

  return {
    itemType: 'nameplate',
    namePlateProduct: product._id,
    qualityOptionId: option._id,
    quantity: incoming.quantity,
    unitPrice: option.price,
    customization: {
      ...customization,
      itemType: 'nameplate',
      qualityLabel: option.label,
      previewUrl: product.images?.[0] || '',
      headingText,
      subText,
    },
  };
};

const buildCorporateGiftCartItem = async (incoming) => {
  if (!mongoose.Types.ObjectId.isValid(incoming.corporateGiftProductId)) {
    throw new ApiError(400, 'Invalid corporate gift product. Please refresh and try again.');
  }

  const product = await CorporateGiftProduct.findById(incoming.corporateGiftProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'Corporate gift product not found');

  const option = product.qualityOptions.id(incoming.qualityOptionId);
  if (!option || !option.isActive) throw new ApiError(404, 'Selected quality option not found');
  if (option.stock < incoming.quantity) {
    throw new ApiError(409, `${product.title} is out of stock for the selected option`);
  }

  const customization = incoming.customization || {};
  const designFileUrl = String(customization.designFileUrl || '').trim();
  if (!designFileUrl) {
    throw new ApiError(400, 'Please upload your logo or design file.');
  }

  const minQty = Math.max(1, product.minOrderQty || 1);
  if (incoming.quantity < minQty) {
    throw new ApiError(400, `Minimum order quantity is ${minQty}.`);
  }

  return {
    itemType: 'corporategift',
    corporateGiftProduct: product._id,
    qualityOptionId: option._id,
    quantity: incoming.quantity,
    unitPrice: option.price,
    customization: {
      ...customization,
      itemType: 'corporategift',
      qualityLabel: option.label,
      previewUrl: product.images?.[0] || '',
      designFileUrl,
      designFileName: customization.designFileName || '',
    },
  };
};

const buildBabyBirthFrameCartItem = async (incoming) => {
  if (!mongoose.Types.ObjectId.isValid(incoming.babyBirthFrameProductId)) {
    throw new ApiError(400, 'Invalid baby birth frame product. Please refresh and try again.');
  }

  const product = await BabyBirthFrameProduct.findById(incoming.babyBirthFrameProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'Baby birth frame product not found');

  const option = product.qualityOptions.id(incoming.qualityOptionId);
  if (!option || !option.isActive) throw new ApiError(404, 'Selected quality option not found');
  if (option.stock < incoming.quantity) {
    throw new ApiError(409, `${product.title} is out of stock for the selected option`);
  }

  const customization = incoming.customization || {};
  const gender = String(customization.gender || '').trim();
  const babyName = String(customization.babyName || '').trim();
  const birthDate = String(customization.birthDate || '').trim();
  const photoUrls = Array.isArray(customization.photoUrls)
    ? customization.photoUrls.map((url) => String(url || '').trim()).filter(Boolean)
    : [];

  if (!gender) throw new ApiError(400, 'Please select gender.');
  if (!babyName) throw new ApiError(400, "Please enter baby's name.");
  if (!birthDate) throw new ApiError(400, 'Please enter birth date.');
  if (!photoUrls.length) throw new ApiError(400, "Please upload baby's photo.");

  const maxPhotos = Math.max(1, product.maxPhotos || 3);
  if (photoUrls.length > maxPhotos) {
    throw new ApiError(400, `Maximum ${maxPhotos} photo(s) allowed.`);
  }

  return {
    itemType: 'babybirthframe',
    babyBirthFrameProduct: product._id,
    qualityOptionId: option._id,
    quantity: incoming.quantity,
    unitPrice: option.price,
    customization: {
      ...customization,
      itemType: 'babybirthframe',
      qualityLabel: option.label,
      previewUrl: photoUrls[0] || product.images?.[0] || '',
      gender,
      babyName,
      birthDate,
      birthTime: String(customization.birthTime || '').trim(),
      weight: String(customization.weight || '').trim(),
      height: String(customization.height || '').trim(),
      hospital: String(customization.hospital || '').trim(),
      proudParents: String(customization.proudParents || '').trim(),
      photoUrls,
    },
  };
};

const buildTrophyCartItem = async (incoming) => {
  if (!mongoose.Types.ObjectId.isValid(incoming.trophyProductId)) {
    throw new ApiError(400, 'Invalid trophy product. Please refresh and try again.');
  }

  const product = await TrophyProduct.findById(incoming.trophyProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'Trophy product not found');

  const option = product.qualityOptions.id(incoming.qualityOptionId);
  if (!option || !option.isActive) throw new ApiError(404, 'Selected quality option not found');
  if (option.stock < incoming.quantity) {
    throw new ApiError(409, `${product.title} is out of stock for the selected option`);
  }

  const customization = incoming.customization || {};
  const mainHeading = String(customization.mainHeading || '').trim();
  const recipientName = String(customization.recipientName || '').trim();

  if (!mainHeading) throw new ApiError(400, 'Please enter main heading text.');
  if (!recipientName) throw new ApiError(400, 'Please enter recipient / winner name.');

  return {
    itemType: 'trophy',
    trophyProduct: product._id,
    qualityOptionId: option._id,
    quantity: incoming.quantity,
    unitPrice: option.price,
    customization: {
      ...customization,
      itemType: 'trophy',
      qualityLabel: option.label,
      previewUrl: product.images?.[0] || '',
      mainHeading,
      recipientName,
      eventName: String(customization.eventName || '').trim(),
      awardDate: String(customization.awardDate || '').trim(),
      organizationName: String(customization.organizationName || '').trim(),
      logoUrl: String(customization.logoUrl || '').trim(),
    },
  };
};

const buildPenPrintCartItem = async (incoming) => {
  if (!mongoose.Types.ObjectId.isValid(incoming.penPrintProductId)) {
    throw new ApiError(400, 'Invalid pen print product. Please refresh and try again.');
  }

  const product = await PenPrintProduct.findById(incoming.penPrintProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'Pen print product not found');

  const option = product.qualityOptions.id(incoming.qualityOptionId);
  if (!option || !option.isActive) throw new ApiError(404, 'Selected quality option not found');
  if (option.stock < incoming.quantity) {
    throw new ApiError(409, `${product.title} is out of stock for the selected option`);
  }

  const customization = incoming.customization || {};
  const username = String(customization.username || '').trim();
  if (!username) throw new ApiError(400, 'Please enter the name to print on the pen.');

  return {
    itemType: 'penprint',
    penPrintProduct: product._id,
    qualityOptionId: option._id,
    quantity: incoming.quantity,
    unitPrice: option.price,
    customization: {
      ...customization,
      itemType: 'penprint',
      qualityLabel: option.label,
      previewUrl: product.images?.[0] || '',
      username,
    },
  };
};

const buildUvDtfStickerCartItem = async (incoming) => {
  if (!mongoose.Types.ObjectId.isValid(incoming.uvDtfStickerProductId)) {
    throw new ApiError(400, 'Invalid UV DTF sticker product. Please refresh and try again.');
  }

  const product = await UvDtfStickerProduct.findById(incoming.uvDtfStickerProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'UV DTF sticker product not found');

  const option = product.qualityOptions.id(incoming.qualityOptionId);
  if (!option || !option.isActive) throw new ApiError(404, 'Selected quality option not found');
  if (option.stock < incoming.quantity) {
    throw new ApiError(409, `${product.title} is out of stock for the selected option`);
  }

  const customization = incoming.customization || {};
  const logoUrl = String(customization.logoUrl || '').trim();
  if (!logoUrl) throw new ApiError(400, 'Please upload your logo image.');

  return {
    itemType: 'uvdtfsticker',
    uvDtfStickerProduct: product._id,
    qualityOptionId: option._id,
    quantity: incoming.quantity,
    unitPrice: option.price,
    customization: {
      ...customization,
      itemType: 'uvdtfsticker',
      qualityLabel: option.label,
      previewUrl: logoUrl || product.images?.[0] || '',
      logoUrl,
      logoFileName: String(customization.logoFileName || '').trim(),
    },
  };
};

const buildProductLabelStickerCartItem = async (incoming) => {
  if (!mongoose.Types.ObjectId.isValid(incoming.productLabelStickerProductId)) {
    throw new ApiError(400, 'Invalid product label sticker. Please refresh and try again.');
  }

  const product = await ProductLabelStickerProduct.findById(incoming.productLabelStickerProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product label sticker not found');

  const option = product.qualityOptions.id(incoming.qualityOptionId);
  if (!option || !option.isActive) throw new ApiError(404, 'Selected label size not found');
  if (option.stock < incoming.quantity) {
    throw new ApiError(409, `${product.title} is out of stock for the selected size`);
  }

  const customization = incoming.customization || {};
  const labelImageUrl = String(customization.labelImageUrl || '').trim();
  if (!labelImageUrl) {
    throw new ApiError(400, 'Please upload your product label image in the selected size.');
  }

  return {
    itemType: 'productlabelsticker',
    productLabelStickerProduct: product._id,
    qualityOptionId: option._id,
    quantity: incoming.quantity,
    unitPrice: option.price,
    customization: {
      ...customization,
      itemType: 'productlabelsticker',
      qualityLabel: option.label,
      previewUrl: labelImageUrl || product.images?.[0] || '',
      labelImageUrl,
      labelFileName: String(customization.labelFileName || '').trim(),
    },
  };
};

const sumSizeQuantities = (sizeQuantities = {}) =>
  Object.values(sizeQuantities).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);

const buildTShirtCartItem = async (incoming) => {
  if (!mongoose.Types.ObjectId.isValid(incoming.tShirtProductId)) {
    throw new ApiError(400, 'Invalid t-shirt product. Please refresh and try again.');
  }

  const product = await TShirtProduct.findById(incoming.tShirtProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'T-shirt product not found');

  const customization = incoming.customization || {};
  const sizeQuantities = customization.sizeQuantities || {};
  const totalPieces = sumSizeQuantities(sizeQuantities);

  if (totalPieces < 1) {
    throw new ApiError(400, 'Please select at least one t-shirt size quantity.');
  }

  if (product.stock < totalPieces) {
    throw new ApiError(409, `${product.title} is out of stock for the selected quantity`);
  }

  const logoUrl = String(customization.logoUrl || '').trim();
  const notes = String(customization.notes || '').trim();
  if (!logoUrl && !notes) {
    throw new ApiError(400, 'Please upload a logo or add print instructions.');
  }

  const productImageUrl = product.images?.[0] || '';

  return {
    itemType: 'tshirt',
    tShirtProduct: product._id,
    quantity: totalPieces,
    unitPrice: product.price,
    customization: {
      ...customization,
      itemType: 'tshirt',
      sizeQuantities,
      totalPieces,
      logoUrl,
      notes,
      productImageUrl,
      previewUrl: logoUrl || productImageUrl || '',
    },
  };
};

const buildCartItem = async (incoming) => {
  if (incoming.godProductId) return buildGodCartItem(incoming);
  if (incoming.namePlateProductId) return buildNamePlateCartItem(incoming);
  if (incoming.corporateGiftProductId) return buildCorporateGiftCartItem(incoming);
  if (incoming.babyBirthFrameProductId) return buildBabyBirthFrameCartItem(incoming);
  if (incoming.trophyProductId) return buildTrophyCartItem(incoming);
  if (incoming.penPrintProductId) return buildPenPrintCartItem(incoming);
  if (incoming.uvDtfStickerProductId) return buildUvDtfStickerCartItem(incoming);
  if (incoming.productLabelStickerProductId) return buildProductLabelStickerCartItem(incoming);
  if (incoming.tShirtProductId) return buildTShirtCartItem(incoming);
  return buildProductCartItem(incoming);
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await findCart(req);
  res.json({ success: true, cart });
});

export const addCartItem = asyncHandler(async (req, res) => {
  const cart = await findCart(req);
  cart.items.push(await buildCartItem(req.body));
  await cart.save();
  const populated = await populateCartItems(Cart.findById(cart._id));
  res.status(201).json({ success: true, cart: populated });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await findCart(req);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, 'Cart item not found');
  item.quantity = req.body.quantity;
  await cart.save();
  res.json({ success: true, cart });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await findCart(req);
  cart.items.pull(req.params.itemId);
  await cart.save();
  res.json({ success: true, cart });
});

export const syncCart = asyncHandler(async (req, res) => {
  const cart = await findCart(req);
  const validatedItems = [];

  for (const incoming of req.body.items) {
    validatedItems.push(await buildCartItem(incoming));
  }

  cart.items = validatedItems;
  await cart.save();
  const populated = await populateCartItems(Cart.findById(cart._id));
  res.json({ success: true, cart: populated });
});
