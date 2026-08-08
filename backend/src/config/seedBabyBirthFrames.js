import { BabyBirthFrameProduct } from '../models/BabyBirthFrameProduct.js';

const DEFAULT_BABY_BIRTH_FRAMES = [
  {
    title: 'Personalized Baby Birth Frame',
    subtitle: 'A Memory for Life',
    description:
      'Celebrate your little one with a beautifully crafted birth frame — add name, birth details, and photos for a keepsake that lasts forever.',
    highlights: ['Premium acrylic finish', 'Custom birth details', 'Photo collage ready', 'Gift packaging'],
    images: [
      'https://images.unsplash.com/photo-1515488042361-ee00e593bb5f?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: '8x10 inch Standard', price: 799, compareAtPrice: 999, stock: 100 },
      { label: '12x16 inch Premium', price: 1299, compareAtPrice: 1599, stock: 80 },
    ],
    maxPhotos: 3,
    genderOptions: ['Boy', 'Girl'],
    isFeatured: true,
    sortOrder: 0,
  },
  {
    title: 'Royal Baby Birth Keepsake Frame',
    subtitle: 'Cherish Every Moment',
    description: 'Elegant birth frame with gold accents — perfect for nursery walls and gifting to new parents.',
    highlights: ['Gold accent design', 'UV printed details', 'Wall mount included'],
    images: [
      'https://images.unsplash.com/photo-1555252333-9f8e92e665df?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: '10x12 inch Classic', price: 899, compareAtPrice: 1099, stock: 90 },
      { label: '14x18 inch Deluxe', price: 1499, compareAtPrice: 1799, stock: 60 },
    ],
    maxPhotos: 3,
    genderOptions: ['Boy', 'Girl'],
    isFeatured: true,
    sortOrder: 1,
  },
];

export async function ensureBabyBirthFrames() {
  const count = await BabyBirthFrameProduct.countDocuments();
  if (count > 0) return;

  await BabyBirthFrameProduct.insertMany(DEFAULT_BABY_BIRTH_FRAMES);
  console.log(`Baby birth frame products seeded (${DEFAULT_BABY_BIRTH_FRAMES.length} items).`);
}
