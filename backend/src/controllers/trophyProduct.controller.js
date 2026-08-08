import { TrophyProduct } from '../models/TrophyProduct.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate } from '../utils/uniqueSlug.js';

export const listTrophyProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    TrophyProduct.find(filter).sort('sortOrder -createdAt').skip(skip).limit(limit),
    TrophyProduct.countDocuments(filter),
  ]);

  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const getTrophyProduct = asyncHandler(async (req, res) => {
  const product = await TrophyProduct.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new ApiError(404, 'Trophy product not found');
  res.json({ success: true, product });
});

export const adminListTrophyProducts = asyncHandler(async (_req, res) => {
  const items = await TrophyProduct.find().sort('sortOrder -createdAt');
  res.json({ success: true, items });
});

export const createTrophyProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  await assignUniqueSlug(body, TrophyProduct);
  const product = await TrophyProduct.create(body);
  res.status(201).json({ success: true, product });
});

export const updateTrophyProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await TrophyProduct.findById(req.params.id).select('slug title');
  if (!existing) throw new ApiError(404, 'Product not found');
  await assignUniqueSlugForUpdate(body, TrophyProduct, existing, req.params.id);
  const product = await TrophyProduct.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const deleteTrophyProduct = asyncHandler(async (req, res) => {
  const product = await TrophyProduct.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});
