import { CorporateGiftProduct } from '../models/CorporateGiftProduct.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate } from '../utils/uniqueSlug.js';

export const listCorporateGiftProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    CorporateGiftProduct.find(filter).sort('sortOrder -createdAt').skip(skip).limit(limit),
    CorporateGiftProduct.countDocuments(filter),
  ]);

  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const getCorporateGiftProduct = asyncHandler(async (req, res) => {
  const product = await CorporateGiftProduct.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new ApiError(404, 'Corporate gift product not found');
  res.json({ success: true, product });
});

export const adminListCorporateGiftProducts = asyncHandler(async (_req, res) => {
  const items = await CorporateGiftProduct.find().sort('sortOrder -createdAt');
  res.json({ success: true, items });
});

export const createCorporateGiftProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  await assignUniqueSlug(body, CorporateGiftProduct);
  const product = await CorporateGiftProduct.create(body);
  res.status(201).json({ success: true, product });
});

export const updateCorporateGiftProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await CorporateGiftProduct.findById(req.params.id).select('slug title');
  if (!existing) throw new ApiError(404, 'Product not found');
  await assignUniqueSlugForUpdate(body, CorporateGiftProduct, existing, req.params.id);
  const product = await CorporateGiftProduct.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const deleteCorporateGiftProduct = asyncHandler(async (req, res) => {
  const product = await CorporateGiftProduct.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});
