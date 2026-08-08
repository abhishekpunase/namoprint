import { TrophyProduct } from '../models/TrophyProduct.js';

const DEFAULT_TROPHIES = [
  {
    title: 'Premium Crystal Achievement Trophy',
    subtitle: 'Celebrate Excellence',
    description:
      'Elegant crystal trophy with custom heading, sub-heading, and winner details — perfect for corporate awards, sports events, and ceremonies.',
    highlights: ['Crystal finish', 'Custom engraving', 'Premium base', 'Gift box included'],
    images: [
      'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: '8 inch Standard', price: 899, compareAtPrice: 1199, stock: 100 },
      { label: '10 inch Premium', price: 1299, compareAtPrice: 1599, stock: 80 },
    ],
    isFeatured: true,
    sortOrder: 0,
  },
  {
    title: 'Gold Star Sports Trophy',
    subtitle: 'Champion Keepsake',
    description: 'Classic gold star trophy for tournaments, school events, and team celebrations with fully personalized text.',
    highlights: ['Gold finish', 'Star design', 'Fast turnaround', 'Bulk orders welcome'],
    images: [
      'https://images.unsplash.com/photo-1517649763962-0c62306601b7?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: '6 inch Team Award', price: 599, compareAtPrice: 799, stock: 120 },
      { label: '9 inch Champion', price: 999, compareAtPrice: 1299, stock: 90 },
    ],
    isFeatured: true,
    sortOrder: 1,
  },
];

export async function ensureTrophies() {
  const count = await TrophyProduct.countDocuments();
  if (count > 0) return;

  await TrophyProduct.insertMany(DEFAULT_TROPHIES);
  console.log(`Trophy products seeded (${DEFAULT_TROPHIES.length} items).`);
}
