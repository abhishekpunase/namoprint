import { TShirtProduct } from '../models/TShirtProduct.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate } from '../utils/uniqueSlug.js';

export const listTShirtProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    TShirtProduct.find(filter).sort('sortOrder -createdAt').skip(skip).limit(limit),
    TShirtProduct.countDocuments(filter)
  ]);

  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const getTShirtProduct = asyncHandler(async (req, res) => {
  const product = await TShirtProduct.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new ApiError(404, 'T-shirt product not found');
  res.json({ success: true, product });
});

export const adminListTShirtProducts = asyncHandler(async (req, res) => {
  const items = await TShirtProduct.find().sort('sortOrder -createdAt');
  res.json({ success: true, items });
});

export const createTShirtProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  await assignUniqueSlug(body, TShirtProduct);
  const product = await TShirtProduct.create(body);
  res.status(201).json({ success: true, product });
});

export const updateTShirtProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await TShirtProduct.findById(req.params.id).select('slug title');
  if (!existing) throw new ApiError(404, 'Product not found');
  await assignUniqueSlugForUpdate(body, TShirtProduct, existing, req.params.id);
  const product = await TShirtProduct.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const deleteTShirtProduct = asyncHandler(async (req, res) => {
  const product = await TShirtProduct.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});
