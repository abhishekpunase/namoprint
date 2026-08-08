import { ProductReview } from '../models/ProductReview.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPublicReviews = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.productSlug) filter.productSlug = req.query.productSlug;
  if (req.query.productType) filter.productType = req.query.productType;
  if (req.query.featured === 'true') filter.isFeatured = true;

  const reviews = await ProductReview.find(filter).sort('sortOrder -createdAt').lean();
  res.json({ success: true, reviews });
});

export const listAdminReviews = asyncHandler(async (_req, res) => {
  const reviews = await ProductReview.find().sort('sortOrder -createdAt').lean();
  res.json({ success: true, reviews });
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await ProductReview.create(req.body);
  res.status(201).json({ success: true, review });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await ProductReview.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!review) {
    res.status(404).json({ success: false, message: 'Review not found' });
    return;
  }
  res.json({ success: true, review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await ProductReview.findByIdAndUpdate(
    req.params.id,
    { isPublished: false },
    { new: true },
  );
  if (!review) {
    res.status(404).json({ success: false, message: 'Review not found' });
    return;
  }
  res.json({ success: true, review });
});
