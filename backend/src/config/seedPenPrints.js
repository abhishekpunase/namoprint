import { PenPrintProduct } from '../models/PenPrintProduct.js';

const DEFAULT_PEN_PRINTS = [
  {
    title: 'Premium Metal Pen with Name Print',
    description:
      'Sleek metal pen with laser-engraved name — perfect for corporate gifts, events, and personal use.',
    highlights: ['Laser engraved', 'Smooth writing', 'Gift box included', 'Bulk orders welcome'],
    images: [
      'https://images.unsplash.com/photo-1583485088030-898b643c5c1a?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: 'Single Pen', price: 199, compareAtPrice: 299, stock: 200 },
      { label: 'Pack of 5', price: 899, compareAtPrice: 1199, stock: 100 },
    ],
    usernamePlaceholder: 'Enter name to print on pen',
    isFeatured: true,
    sortOrder: 0,
  },
  {
    title: 'Classic Ballpoint Pen — Custom Name',
    description: 'Everyday ballpoint pen with your name printed on the barrel. Great for schools and offices.',
    highlights: ['Durable body', 'Blue ink refill', 'Fast delivery'],
    images: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265f3a5?q=80&w=800&auto=format&fit=crop',
    ],
    qualityOptions: [
      { label: 'Standard Print', price: 149, compareAtPrice: 199, stock: 250 },
      { label: 'Premium Finish', price: 249, compareAtPrice: 349, stock: 150 },
    ],
    usernamePlaceholder: 'Your name here',
    isFeatured: true,
    sortOrder: 1,
  },
];

export async function ensurePenPrints() {
  const count = await PenPrintProduct.countDocuments();
  if (count > 0) return;

  await PenPrintProduct.insertMany(DEFAULT_PEN_PRINTS);
  console.log(`Pen print products seeded (${DEFAULT_PEN_PRINTS.length} items).`);
}
