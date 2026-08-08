import { PenPrintProduct } from '../models/PenPrintProduct.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate } from '../utils/uniqueSlug.js';

export const listPenPrintProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    PenPrintProduct.find(filter).sort('sortOrder -createdAt').skip(skip).limit(limit),
    PenPrintProduct.countDocuments(filter),
  ]);

  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const getPenPrintProduct = asyncHandler(async (req, res) => {
  const product = await PenPrintProduct.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new ApiError(404, 'Pen print product not found');
  res.json({ success: true, product });
});

export const adminListPenPrintProducts = asyncHandler(async (_req, res) => {
  const items = await PenPrintProduct.find().sort('sortOrder -createdAt');
  res.json({ success: true, items });
});

export const createPenPrintProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  await assignUniqueSlug(body, PenPrintProduct);
  const product = await PenPrintProduct.create(body);
  res.status(201).json({ success: true, product });
});

export const updatePenPrintProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await PenPrintProduct.findById(req.params.id).select('slug title');
  if (!existing) throw new ApiError(404, 'Product not found');
  await assignUniqueSlugForUpdate(body, PenPrintProduct, existing, req.params.id);
  const product = await PenPrintProduct.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const deletePenPrintProduct = asyncHandler(async (req, res) => {
  const product = await PenPrintProduct.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});
