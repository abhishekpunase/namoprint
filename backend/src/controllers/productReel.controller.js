import { ProductReel } from '../models/ProductReel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPublicProductReels = asyncHandler(async (_req, res) => {
  const reels = await ProductReel.find({ isActive: true }).sort('sortOrder -createdAt').lean();
  res.json({ success: true, reels });
});

export const listAdminProductReels = asyncHandler(async (_req, res) => {
  const reels = await ProductReel.find().sort('sortOrder -createdAt').lean();
  res.json({ success: true, reels });
});

export const createProductReel = asyncHandler(async (req, res) => {
  const reel = await ProductReel.create(req.body);
  res.status(201).json({ success: true, reel });
});

export const updateProductReel = asyncHandler(async (req, res) => {
  const reel = await ProductReel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!reel) {
    res.status(404).json({ success: false, message: 'Reel not found' });
    return;
  }
  res.json({ success: true, reel });
});

export const deleteProductReel = asyncHandler(async (req, res) => {
  const reel = await ProductReel.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!reel) {
    res.status(404).json({ success: false, message: 'Reel not found' });
    return;
  }
  res.json({ success: true, reel });
});
