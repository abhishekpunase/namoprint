import { ProductLabelStickerProduct } from '../models/ProductLabelStickerProduct.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate } from '../utils/uniqueSlug.js';

export const listProductLabelStickerProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    ProductLabelStickerProduct.find(filter).sort('sortOrder -createdAt').skip(skip).limit(limit),
    ProductLabelStickerProduct.countDocuments(filter),
  ]);

  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const getProductLabelStickerProduct = asyncHandler(async (req, res) => {
  const product = await ProductLabelStickerProduct.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new ApiError(404, 'Product label sticker not found');
  res.json({ success: true, product });
});

export const adminListProductLabelStickerProducts = asyncHandler(async (_req, res) => {
  const items = await ProductLabelStickerProduct.find().sort('sortOrder -createdAt');
  res.json({ success: true, items });
});

export const createProductLabelStickerProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  await assignUniqueSlug(body, ProductLabelStickerProduct);
  const product = await ProductLabelStickerProduct.create(body);
  res.status(201).json({ success: true, product });
});

export const updateProductLabelStickerProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await ProductLabelStickerProduct.findById(req.params.id).select('slug title');
  if (!existing) throw new ApiError(404, 'Product not found');
  await assignUniqueSlugForUpdate(body, ProductLabelStickerProduct, existing, req.params.id);
  const product = await ProductLabelStickerProduct.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const deleteProductLabelStickerProduct = asyncHandler(async (req, res) => {
  const product = await ProductLabelStickerProduct.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});
