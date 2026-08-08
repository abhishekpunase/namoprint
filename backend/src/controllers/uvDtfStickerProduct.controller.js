import { UvDtfStickerProduct } from '../models/UvDtfStickerProduct.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate } from '../utils/uniqueSlug.js';

export const listUvDtfStickerProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    UvDtfStickerProduct.find(filter).sort('sortOrder -createdAt').skip(skip).limit(limit),
    UvDtfStickerProduct.countDocuments(filter),
  ]);

  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const getUvDtfStickerProduct = asyncHandler(async (req, res) => {
  const product = await UvDtfStickerProduct.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new ApiError(404, 'UV DTF sticker product not found');
  res.json({ success: true, product });
});

export const adminListUvDtfStickerProducts = asyncHandler(async (_req, res) => {
  const items = await UvDtfStickerProduct.find().sort('sortOrder -createdAt');
  res.json({ success: true, items });
});

export const createUvDtfStickerProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  await assignUniqueSlug(body, UvDtfStickerProduct);
  const product = await UvDtfStickerProduct.create(body);
  res.status(201).json({ success: true, product });
});

export const updateUvDtfStickerProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await UvDtfStickerProduct.findById(req.params.id).select('slug title');
  if (!existing) throw new ApiError(404, 'Product not found');
  await assignUniqueSlugForUpdate(body, UvDtfStickerProduct, existing, req.params.id);
  const product = await UvDtfStickerProduct.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const deleteUvDtfStickerProduct = asyncHandler(async (req, res) => {
  const product = await UvDtfStickerProduct.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});
