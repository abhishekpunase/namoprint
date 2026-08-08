/**
 * Seeds 10 God Photo Frame products + 5 Name Plate products.
 * Run with:  node src/scripts/seedGodAndNamePlate.js
 *
 * This is a brand-new script, separate from scripts/seed.js —
 * running it never touches the existing Product/Category data.
 *
 * NOTE on images: the URLs below are live, working placeholder
 * images (placehold.co) labelled with each deity/product name so
 * you can see the full flow (list -> detail -> order) working
 * end-to-end today. Replace the `images` arrays with your real
 * product photography URLs whenever you're ready — nothing else
 * needs to change.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { GodProduct } from '../models/GodProduct.js';
import { NamePlateProduct } from '../models/NamePlateProduct.js';

const placeholder = (label, bg = 'f5b400', fg = '1a1a1a') =>
  `https://placehold.co/600x800/${bg}/${fg}?text=${encodeURIComponent(label)}`;

const godProducts = [
  { title: 'Lord Ganesha Photo Frame', deity: 'Ganesha' },
  { title: 'Lord Krishna Photo Frame', deity: 'Krishna' },
  { title: 'Goddess Lakshmi Photo Frame', deity: 'Lakshmi' },
  { title: 'Lord Shiva Photo Frame', deity: 'Shiva' },
  { title: 'Goddess Durga Photo Frame', deity: 'Durga' },
  { title: 'Lord Hanuman Photo Frame', deity: 'Hanuman' },
  { title: 'Goddess Saraswati Photo Frame', deity: 'Saraswati' },
  { title: 'Sai Baba Photo Frame', deity: 'Sai Baba' },
  { title: 'Lord Vishnu Photo Frame', deity: 'Vishnu' },
  { title: 'Radha Krishna Photo Frame', deity: 'Radha Krishna' }
].map((item, index) => ({
  ...item,
  description: `Premium readymade ${item.deity} acrylic photo frame, ready to hang. No customization — just pick your quality and size.`,
  highlights: ['Ready to ship', 'High-gloss acrylic print', 'Fade-resistant UV printing', 'Ready to hang'],
  images: [placeholder(item.deity), placeholder(`${item.deity} - side view`, '1a1a1a', 'f5b400')],
  qualityOptions: [
    { label: '8x12 inch - Standard Acrylic', price: 499, compareAtPrice: 699, stock: 100 },
    { label: '12x18 inch - Premium Acrylic', price: 899, compareAtPrice: 1199, stock: 100 },
    { label: '16x24 inch - Deluxe Acrylic with Frame', price: 1499, compareAtPrice: 1999, stock: 50 }
  ],
  isFeatured: index < 4,
  isActive: true,
  sortOrder: index
}));

const namePlateProducts = [
  { title: 'Classic Golden Acrylic Name Plate' },
  { title: 'Modern Black Matte Name Plate' },
  { title: 'Wooden Finish Name Plate' },
  { title: 'LED Backlit Name Plate' },
  { title: 'Rustic Copper Name Plate' }
].map((item, index) => ({
  ...item,
  description: `${item.title} — tell us your name and we'll get it made. No design tool needed, just type your text.`,
  highlights: ['Weatherproof', 'Ready in 3-5 days', 'Custom text engraving'],
  images: [placeholder(item.title, '1a1a1a', 'f5b400'), placeholder(`${item.title} - installed`, 'f5b400', '1a1a1a')],
  qualityOptions: [
    { label: '12x5 inch - Standard', price: 599, compareAtPrice: 799, stock: 100 },
    { label: '16x6 inch - Premium', price: 999, compareAtPrice: 1299, stock: 100 },
    { label: '20x8 inch - Deluxe', price: 1499, compareAtPrice: 1899, stock: 50 }
  ],
  headingPlaceholder: 'e.g. The Sharma Family',
  subTextPlaceholder: 'e.g. House No. 24, Green Park',
  isFeatured: index < 2,
  isActive: true,
  sortOrder: index
}));

const run = async () => {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB. Seeding God Products + Name Plate Products...');

  await GodProduct.deleteMany({});
  await GodProduct.insertMany(godProducts);
  console.log(`Inserted ${godProducts.length} God Photo Frame products.`);

  await NamePlateProduct.deleteMany({});
  await NamePlateProduct.insertMany(namePlateProducts);
  console.log(`Inserted ${namePlateProducts.length} Name Plate products.`);

  await mongoose.disconnect();
  console.log('Done.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
