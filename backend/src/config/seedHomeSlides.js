import { HomeSlide } from '../models/HomeSlide.js';

const DEFAULT_HOME_SLIDES = [
  {
    title: 'Custom Photo\nWall Clocks',
    subtitle: 'Personalize your time',
    priceLabel: 'From ₹499',
    backgroundClass: 'bg-[#FBF0DD]',
    imageUrl: 'https://m.media-amazon.com/images/I/718qXZen-lL.jpg',
    linkUrl: '/custom-wall-watches',
    sortOrder: 0,
  },
  {
    title: 'Custom Printed\nT-Shirts',
    subtitle: 'Wear your story',
    priceLabel: 'From ₹399',
    backgroundClass: 'bg-[#F3E8EE]',
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80&auto=format&fit=crop',
    linkUrl: '/t-shirt-printing',
    sortOrder: 1,
  },
  {
    title: 'Custom Photo\nFrames',
    subtitle: 'Frame your favorite moments',
    priceLabel: 'From ₹349',
    backgroundClass: 'bg-[#EAF0F6]',
    imageUrl: 'https://www.giftify.in/cdn/shop/files/MiniPhotoFrame1.jpg?v=1696763406',
    linkUrl: '/god-photo-frames',
    sortOrder: 2,
  },
  {
    title: 'Custom Photo\nCushions',
    subtitle: 'Cozy up with your memories',
    priceLabel: 'From ₹449',
    backgroundClass: 'bg-[#F5EDE4]',
    imageUrl:
      'https://d2k16ouylthisj.cloudfront.net/photo_cushion_fur_snowy_white/4.0.0/product_images/web/fur-lined-photo-cushion-1.jpg',
    linkUrl: '/products',
    sortOrder: 3,
  },
  {
    title: 'Custom Photo\nCalendars',
    subtitle: 'Every month, a new memory',
    priceLabel: 'From ₹399',
    backgroundClass: 'bg-[#EDEFE3]',
    imageUrl: 'https://www.photoland.in/wp-content/uploads/2020/02/2026-Calendar-6-H.jpg',
    linkUrl: '/products',
    sortOrder: 4,
  },
];

export async function ensureHomeSlides() {
  const count = await HomeSlide.countDocuments();
  if (count > 0) return;

  await HomeSlide.insertMany(DEFAULT_HOME_SLIDES);
  console.log(`Home slider seeded (${DEFAULT_HOME_SLIDES.length} slides).`);
}
