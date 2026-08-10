import { HomeOfferMarqueeItem } from '../models/HomeOfferMarqueeItem.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPublicHomeOfferMarquee = asyncHandler(async (_req, res) => {
  const items = await HomeOfferMarqueeItem.find({ isActive: true }).sort('sortOrder -createdAt').lean();
  res.json({ success: true, items });
});

export const listAdminHomeOfferMarquee = asyncHandler(async (_req, res) => {
  const items = await HomeOfferMarqueeItem.find().sort('sortOrder -createdAt').lean();
  res.json({ success: true, items });
});

export const createHomeOfferMarqueeItem = asyncHandler(async (req, res) => {
  const item = await HomeOfferMarqueeItem.create(req.body);
  res.status(201).json({ success: true, item });
});

export const updateHomeOfferMarqueeItem = asyncHandler(async (req, res) => {
  const item = await HomeOfferMarqueeItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    res.status(404).json({ success: false, message: 'Marquee line not found' });
    return;
  }
  res.json({ success: true, item });
});

export const deleteHomeOfferMarqueeItem = asyncHandler(async (req, res) => {
  const item = await HomeOfferMarqueeItem.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!item) {
    res.status(404).json({ success: false, message: 'Marquee line not found' });
    return;
  }
  res.json({ success: true, item });
});
