import { ProductReel } from '../models/ProductReel.js';

const DEFAULT_PRODUCT_REELS = [
  {
    categoryLabel: 'Acrylic',
    productName: 'Baby Frame',
    priceLabel: '₹399',
    likesLabel: '298',
    videoUrl:
      'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766942064646-wtya9i.mp4',
    sortOrder: 0,
  },
  {
    categoryLabel: 'Acrylic',
    productName: 'Wall Frame',
    priceLabel: '₹359',
    likesLabel: '900',
    videoUrl:
      'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766941654703-romtz.mp4',
    sortOrder: 1,
  },
  {
    categoryLabel: 'Acrylic',
    productName: 'Wall Clock',
    priceLabel: '₹399',
    likesLabel: '790',
    videoUrl:
      'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766938943981-d5vchq.mp4',
    sortOrder: 2,
  },
  {
    categoryLabel: 'Acrylic',
    productName: 'Photo Frame',
    priceLabel: '₹397',
    likesLabel: '2.5K',
    videoUrl:
      'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766942064646-wtya9i.mp4',
    sortOrder: 3,
  },
  {
    categoryLabel: 'Acrylic',
    productName: 'Wall Photo',
    priceLabel: '₹399',
    likesLabel: '5.3K',
    videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
    sortOrder: 4,
  },
];

export async function ensureProductReels() {
  const count = await ProductReel.countDocuments();
  if (count > 0) return;

  await ProductReel.insertMany(DEFAULT_PRODUCT_REELS);
  console.log(`Product reels seeded (${DEFAULT_PRODUCT_REELS.length} reels).`);
}
