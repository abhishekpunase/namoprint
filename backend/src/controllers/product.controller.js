import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate } from '../utils/uniqueSlug.js';

const SLUG_ALIASES = {
  'family-memory-wall-watch': 'square-round-acrylic-photo-wall-clock',
};

export const listProducts = asyncHandler(async (req, res) => {
  const { q, category, productType, page, limit } = req.query;
  const filter = { isActive: true };
  if (category) filter.$or = [{ category }, { subCategory: category }];
  if (productType) filter.productType = productType;
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find(filter).populate('category subCategory').skip(skip).limit(limit).sort('-createdAt'),
    Product.countDocuments(filter)
  ]);

  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const getProduct = asyncHandler(async (req, res) => {
  const slug = SLUG_ALIASES[req.params.slug] || req.params.slug;
  const product = await Product.findOne({ slug, isActive: true }).populate(
    'category subCategory'
  );
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  await assignUniqueSlug(body, Product);
  const product = await Product.create(body);
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await Product.findById(req.params.id).select('slug title');
  if (!existing) throw new ApiError(404, 'Product not found');
  await assignUniqueSlugForUpdate(body, Product, existing, req.params.id);
  const product = await Product.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});
