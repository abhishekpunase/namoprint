import { BabyBirthFrameProduct } from '../models/BabyBirthFrameProduct.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate } from '../utils/uniqueSlug.js';

export const listBabyBirthFrameProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    BabyBirthFrameProduct.find(filter).sort('sortOrder -createdAt').skip(skip).limit(limit),
    BabyBirthFrameProduct.countDocuments(filter),
  ]);

  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const getBabyBirthFrameProduct = asyncHandler(async (req, res) => {
  const product = await BabyBirthFrameProduct.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new ApiError(404, 'Baby birth frame product not found');
  res.json({ success: true, product });
});

export const adminListBabyBirthFrameProducts = asyncHandler(async (_req, res) => {
  const items = await BabyBirthFrameProduct.find().sort('sortOrder -createdAt');
  res.json({ success: true, items });
});

export const createBabyBirthFrameProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  await assignUniqueSlug(body, BabyBirthFrameProduct);
  const product = await BabyBirthFrameProduct.create(body);
  res.status(201).json({ success: true, product });
});

export const updateBabyBirthFrameProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await BabyBirthFrameProduct.findById(req.params.id).select('slug title');
  if (!existing) throw new ApiError(404, 'Product not found');
  await assignUniqueSlugForUpdate(body, BabyBirthFrameProduct, existing, req.params.id);
  const product = await BabyBirthFrameProduct.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const deleteBabyBirthFrameProduct = asyncHandler(async (req, res) => {
  const product = await BabyBirthFrameProduct.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});
