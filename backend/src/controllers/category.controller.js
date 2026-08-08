import { Category } from '../models/Category.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate, slugFromTitle } from '../utils/uniqueSlug.js';

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true }).sort('sortOrder name').lean();
  res.json({ success: true, categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.slug && body.name) body.slug = slugFromTitle(body.name);
  await assignUniqueSlug(body, Category);
  const category = await Category.create(body);
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await Category.findById(req.params.id).select('slug name');
  if (!existing) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }
  if (!body.slug && body.name) body.slug = slugFromTitle(body.name);
  await assignUniqueSlugForUpdate(body, Category, existing, req.params.id);
  const category = await Category.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true
  });
  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }
  res.json({ success: true, category });
});
