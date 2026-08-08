import { HomeSlide } from '../models/HomeSlide.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPublicHomeSlides = asyncHandler(async (_req, res) => {
  const slides = await HomeSlide.find({ isActive: true }).sort('sortOrder -createdAt').lean();
  res.json({ success: true, slides });
});

export const listAdminHomeSlides = asyncHandler(async (_req, res) => {
  const slides = await HomeSlide.find().sort('sortOrder -createdAt').lean();
  res.json({ success: true, slides });
});

export const createHomeSlide = asyncHandler(async (req, res) => {
  const slide = await HomeSlide.create(req.body);
  res.status(201).json({ success: true, slide });
});

export const updateHomeSlide = asyncHandler(async (req, res) => {
  const slide = await HomeSlide.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!slide) {
    res.status(404).json({ success: false, message: 'Slide not found' });
    return;
  }
  res.json({ success: true, slide });
});

export const deleteHomeSlide = asyncHandler(async (req, res) => {
  const slide = await HomeSlide.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!slide) {
    res.status(404).json({ success: false, message: 'Slide not found' });
    return;
  }
  res.json({ success: true, slide });
});
