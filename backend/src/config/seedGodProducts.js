import { GodProduct } from '../models/GodProduct.js';

const placeholder = (label, bg = 'f5b400', fg = '1a1a1a') =>
  `https://placehold.co/600x800/${bg}/${fg}?text=${encodeURIComponent(label)}`;

const DEFAULT_GOD_PRODUCTS = [
  { title: 'Lord Ganesha Photo Frame', deity: 'Ganesha' },
  { title: 'Lord Krishna Photo Frame', deity: 'Krishna' },
  { title: 'Goddess Lakshmi Photo Frame', deity: 'Lakshmi' },
  { title: 'Lord Shiva Photo Frame', deity: 'Shiva' },
  { title: 'Goddess Durga Photo Frame', deity: 'Durga' },
  { title: 'Lord Hanuman Photo Frame', deity: 'Hanuman' },
  { title: 'Goddess Saraswati Photo Frame', deity: 'Saraswati' },
  { title: 'Sai Baba Photo Frame', deity: 'Sai Baba' },
  { title: 'Lord Vishnu Photo Frame', deity: 'Vishnu' },
  { title: 'Radha Krishna Photo Frame', deity: 'Radha Krishna' },
].map((item, index) => ({
  ...item,
  description: `Premium readymade ${item.deity} acrylic photo frame, ready to hang.`,
  highlights: ['Ready to ship', 'High-gloss acrylic print', 'Fade-resistant UV printing', 'Ready to hang'],
  images: [placeholder(item.deity), placeholder(`${item.deity} - side view`, '1a1a1a', 'f5b400')],
  qualityOptions: [
    { label: '8x12 inch - Standard Acrylic', price: 499, compareAtPrice: 699, stock: 100 },
    { label: '12x18 inch - Premium Acrylic', price: 899, compareAtPrice: 1199, stock: 100 },
    { label: '16x24 inch - Deluxe Acrylic with Frame', price: 1499, compareAtPrice: 1999, stock: 50 },
  ],
  isFeatured: index < 4,
  isActive: true,
  sortOrder: index,
}));

export async function ensureGodProducts() {
  const count = await GodProduct.countDocuments();
  if (count > 0) return;

  await GodProduct.insertMany(DEFAULT_GOD_PRODUCTS);
  console.log(`God photo frame products seeded (${DEFAULT_GOD_PRODUCTS.length} items).`);
}
