import { CorporateGiftProduct } from '../models/CorporateGiftProduct.js';

const DEFAULT_CORPORATE_GIFTS = [
  {
    title: 'Branded Acrylic Sign Board',
    description:
      'Premium acrylic sign with your company logo — ideal for reception desks, salon branding, and office entrances.',
    highlights: ['Logo printing', 'Weather resistant', 'Professional finish'],
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: '12x8 inch Standard', price: 899, compareAtPrice: 1199, stock: 100 },
      { label: '18x12 inch Premium', price: 1499, compareAtPrice: 1899, stock: 80 },
    ],
    minOrderQty: 1,
    bulkOrderNote: 'Order 50+ items and get 15% OFF. Contact us for custom branding.',
    isFeatured: true,
    sortOrder: 0,
  },
  {
    title: 'Corporate Gift Combo Box',
    description: 'Custom branded gift combo for employees and clients — upload your logo and we handle the rest.',
    highlights: ['Bulk orders welcome', 'Custom packaging', 'Fast turnaround'],
    images: [
      'https://images.unsplash.com/photo-1549460340-1734792b3b0c?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: 'Standard Combo', price: 499, compareAtPrice: 699, stock: 120 },
      { label: 'Premium Combo', price: 799, compareAtPrice: 999, stock: 90 },
    ],
    minOrderQty: 1,
    isFeatured: true,
    sortOrder: 1,
  },
];

export async function ensureCorporateGifts() {
  const count = await CorporateGiftProduct.countDocuments();
  if (count > 0) return;

  await CorporateGiftProduct.insertMany(DEFAULT_CORPORATE_GIFTS);
  console.log(`Corporate gift products seeded (${DEFAULT_CORPORATE_GIFTS.length} items).`);
}
