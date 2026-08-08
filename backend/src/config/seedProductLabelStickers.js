import { ProductLabelStickerProduct } from '../models/ProductLabelStickerProduct.js';

const DEFAULT_PRODUCT_LABEL_STICKERS = [
  {
    title: 'Custom Product Label Stickers',
    description:
      'Upload your product label artwork in the exact sticker size — we print and deliver ready-to-apply labels for bottles, jars, boxes, and packaging.',
    highlights: ['Exact size print', 'Water resistant', 'Peel & stick', 'Bulk packs available'],
    images: [
      'https://images.unsplash.com/photo-1586075010923-2dd457fb0b53?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: '2×2 inch (50×50 mm)', price: 199, compareAtPrice: 299, stock: 200 },
      { label: '3×4 inch (75×100 mm)', price: 349, compareAtPrice: 449, stock: 150 },
      { label: '4×6 inch (100×150 mm)', price: 499, compareAtPrice: 649, stock: 120 },
    ],
    labelUploadHint: 'Upload label image in the exact size you selected — we print it as stickers',
    isFeatured: true,
    sortOrder: 0,
  },
  {
    title: 'Round Jar & Bottle Label Stickers',
    description: 'Perfect for food jars, cosmetics, and beverage bottles. Send artwork matching your chosen label diameter.',
    highlights: ['Round & oval sizes', 'Food-safe option', 'Matte or gloss finish'],
    images: [
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: '2 inch round (50 mm)', price: 249, compareAtPrice: 349, stock: 180 },
      { label: '3 inch round (75 mm)', price: 399, compareAtPrice: 549, stock: 140 },
    ],
    isFeatured: true,
    sortOrder: 1,
  },
];

export async function ensureProductLabelStickers() {
  const count = await ProductLabelStickerProduct.countDocuments();
  if (count > 0) return;

  await ProductLabelStickerProduct.insertMany(DEFAULT_PRODUCT_LABEL_STICKERS);
  console.log(`Product label sticker products seeded (${DEFAULT_PRODUCT_LABEL_STICKERS.length} items).`);
}
