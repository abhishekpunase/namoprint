import { UvDtfStickerProduct } from '../models/UvDtfStickerProduct.js';

const DEFAULT_UV_DTF_STICKERS = [
  {
    title: 'Custom UV DTF Logo Stickers',
    description:
      'High-quality UV DTF stickers with your logo — durable, vibrant, and perfect for bottles, packaging, and branding.',
    highlights: ['UV DTF print', 'Water resistant', 'Custom logo', 'Bulk orders welcome'],
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: 'Small Sheet (10 pcs)', price: 299, compareAtPrice: 399, stock: 200 },
      { label: 'Medium Sheet (25 pcs)', price: 649, compareAtPrice: 899, stock: 150 },
      { label: 'Large Sheet (50 pcs)', price: 1199, compareAtPrice: 1499, stock: 100 },
    ],
    logoUploadHint: 'Upload your logo image (PNG, JPG, SVG)',
    isFeatured: true,
    sortOrder: 0,
  },
  {
    title: 'Premium Brand Logo UV DTF Stickers',
    description: 'Premium finish UV DTF stickers for product labels, gift boxes, and promotional packs.',
    highlights: ['Sharp detail', 'Scratch resistant', 'Fast turnaround'],
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: 'Starter Pack (15 pcs)', price: 449, compareAtPrice: 599, stock: 180 },
      { label: 'Business Pack (40 pcs)', price: 999, compareAtPrice: 1299, stock: 120 },
    ],
    isFeatured: true,
    sortOrder: 1,
  },
];

export async function ensureUvDtfStickers() {
  const count = await UvDtfStickerProduct.countDocuments();
  if (count > 0) return;

  await UvDtfStickerProduct.insertMany(DEFAULT_UV_DTF_STICKERS);
  console.log(`UV DTF sticker products seeded (${DEFAULT_UV_DTF_STICKERS.length} items).`);
}
