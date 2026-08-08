import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { TShirtProduct } from '../models/TShirtProduct.js';

const products = [
  {
    title: 'Sports Dry-Fit T-Shirt',
    slug: 'sports-dry-fit-t-shirt',
    description: 'Lightweight dry-fit tee with your custom logo or text — perfect for teams, events, and promotions.',
    longDescription:
      'Our Sports Dry-Fit T-Shirt is built for comfort and performance. Upload your logo in JPG, PNG, or SVG and tell us exactly where to print. Available in S through XXL with the same per-piece price. Ideal for sports teams, corporate events, and bulk orders.',
    highlights: ['Dry-fit fabric', 'HD print', 'All sizes', 'Bulk friendly'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&auto=format&fit=crop',
    ],
    price: 699,
    compareAtPrice: 804,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 500,
    rating: 4.3,
    reviewCount: 655,
    isFeatured: true,
    isActive: true,
    sortOrder: 0,
  },
  {
    title: 'Premium Cotton Round Neck T-Shirt',
    slug: 'premium-cotton-round-neck-t-shirt',
    description: 'Soft cotton tee with vibrant custom printing for everyday wear and gifting.',
    longDescription:
      'Premium 180 GSM cotton with smooth finish. Upload your artwork and select quantities per size. Same easy cart → checkout flow as all Namo Prints products.',
    highlights: ['100% cotton feel', 'Soft touch', 'Vivid colors', 'Gift ready'],
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80&auto=format&fit=crop',
    ],
    price: 499,
    compareAtPrice: 649,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 400,
    rating: 4.6,
    reviewCount: 312,
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
  },
];

const run = async () => {
  await mongoose.connect(env.mongoUri);
  console.log('Seeding T-Shirt products…');

  for (const entry of products) {
    const exists = await TShirtProduct.findOne({ slug: entry.slug });
    if (exists) {
      console.log(`Skip (exists): ${entry.slug}`);
      continue;
    }
    await TShirtProduct.create(entry);
    console.log(`Created: ${entry.title}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
