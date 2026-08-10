import { NamePlateProduct } from '../models/NamePlateProduct.js';

const placeholder = (label, bg = '1a1a1a', fg = 'f5b400') =>
  `https://placehold.co/600x800/${bg}/${fg}?text=${encodeURIComponent(label)}`;

const DEFAULT_NAME_PLATE_PRODUCTS = [
  { title: 'Classic Golden Acrylic Name Plate' },
  { title: 'Modern Black Matte Name Plate' },
  { title: 'Wooden Finish Name Plate' },
  { title: 'LED Backlit Name Plate' },
  { title: 'Rustic Copper Name Plate' },
].map((item, index) => ({
  ...item,
  description: `${item.title} — tell us your name and we'll get it made.`,
  highlights: ['Weatherproof', 'Ready in 3-5 days', 'Custom text engraving'],
  images: [placeholder(item.title), placeholder(`${item.title} - installed`, 'f5b400', '1a1a1a')],
  qualityOptions: [
    { label: '12x5 inch - Standard', price: 599, compareAtPrice: 799, stock: 100 },
    { label: '16x6 inch - Premium', price: 999, compareAtPrice: 1299, stock: 100 },
    { label: '20x8 inch - Deluxe', price: 1499, compareAtPrice: 1899, stock: 50 },
  ],
  headingPlaceholder: 'e.g. The Sharma Family',
  subTextPlaceholder: 'e.g. House No. 24, Green Park',
  isFeatured: index < 2,
  isActive: true,
  sortOrder: index,
}));

export async function ensureNamePlateProducts() {
  const count = await NamePlateProduct.countDocuments();
  if (count > 0) return;

  await NamePlateProduct.insertMany(DEFAULT_NAME_PLATE_PRODUCTS);
  console.log(`Name plate products seeded (${DEFAULT_NAME_PLATE_PRODUCTS.length} items).`);
}
