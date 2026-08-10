import { HomeTestimonial } from '../models/HomeTestimonial.js';
import { HomeTestimonialSection } from '../models/HomeTestimonialSection.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function getOrCreateSection() {
  let section = await HomeTestimonialSection.findOne({ key: 'default' }).lean();
  if (!section) {
    section = (await HomeTestimonialSection.create({ key: 'default' })).toObject();
  }
  return section;
}

export const listPublicHomeTestimonials = asyncHandler(async (_req, res) => {
  const [section, testimonials] = await Promise.all([
    getOrCreateSection(),
    HomeTestimonial.find({ isActive: true }).sort('sortOrder -createdAt').lean(),
  ]);
  res.json({ success: true, section, testimonials });
});

export const listAdminHomeTestimonials = asyncHandler(async (_req, res) => {
  const [section, testimonials] = await Promise.all([
    getOrCreateSection(),
    HomeTestimonial.find().sort('sortOrder -createdAt').lean(),
  ]);
  res.json({ success: true, section, testimonials });
});

export const updateHomeTestimonialSection = asyncHandler(async (req, res) => {
  const section = await HomeTestimonialSection.findOneAndUpdate(
    { key: 'default' },
    req.body,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  res.json({ success: true, section });
});

export const createHomeTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await HomeTestimonial.create(req.body);
  res.status(201).json({ success: true, testimonial });
});

export const updateHomeTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await HomeTestimonial.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!testimonial) {
    res.status(404).json({ success: false, message: 'Testimonial not found' });
    return;
  }
  res.json({ success: true, testimonial });
});

export const deleteHomeTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await HomeTestimonial.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!testimonial) {
    res.status(404).json({ success: false, message: 'Testimonial not found' });
    return;
  }
  res.json({ success: true, testimonial });
});
