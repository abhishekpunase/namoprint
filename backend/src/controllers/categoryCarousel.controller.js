import { CategoryCarouselItem } from '../models/CategoryCarouselItem.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPublicCategoryCarousel = asyncHandler(async (_req, res) => {
  const items = await CategoryCarouselItem.find({ isActive: true }).sort('sortOrder -createdAt').lean();
  res.json({ success: true, items });
});

export const listAdminCategoryCarousel = asyncHandler(async (_req, res) => {
  const items = await CategoryCarouselItem.find().sort('sortOrder -createdAt').lean();
  res.json({ success: true, items });
});

export const createCategoryCarouselItem = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.linkUrl?.trim()) {
    body.linkUrl = `/products?type=${body.productType}`;
  }
  const item = await CategoryCarouselItem.create(body);
  res.status(201).json({ success: true, item });
});

export const updateCategoryCarouselItem = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.productType && body.linkUrl === '') {
    body.linkUrl = `/products?type=${body.productType}`;
  }
  const item = await CategoryCarouselItem.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    res.status(404).json({ success: false, message: 'Category item not found' });
    return;
  }
  res.json({ success: true, item });
});

export const deleteCategoryCarouselItem = asyncHandler(async (req, res) => {
  const item = await CategoryCarouselItem.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!item) {
    res.status(404).json({ success: false, message: 'Category item not found' });
    return;
  }
  res.json({ success: true, item });
});
