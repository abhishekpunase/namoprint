import mongoose from 'mongoose';
import slugify from 'slugify';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

/** Matches storefront homepage sections (frontend homeCategories) */
const DEV_HOMEPAGE_CATEGORIES = [
  { name: 'Acrylic Wall Photo', productType: 'acrylic-wall-photo', sortOrder: 1 },
  { name: 'Acrylic Wall Clock', productType: 'custom-wall-watch', sortOrder: 2 },
  { name: 'Baby Frames', productType: 'acrylic-photo-frame', sortOrder: 3 },
  { name: 'Framed Acrylic Photo', productType: 'acrylic-photo-frame', sortOrder: 4 },
  { name: 'Name Plates', productType: 'acrylic-name-plate', sortOrder: 5 },
  { name: 'QR Standee', productType: 'logo-stickers', sortOrder: 6 },
  { name: 'Trophies', productType: 'trophy', sortOrder: 7 },
  { name: 'Corporate Gifts', productType: 'corporate-gift-printing', sortOrder: 8 },
  { name: 'Wedding Card', productType: 'uv-dtf-stickers', sortOrder: 9 },
  { name: 'Monogram Plates', productType: 'acrylic-monogram-nameplate', sortOrder: 10 },
  { name: 'Wooden Photo Frame', productType: 'wooden-photo-frame', sortOrder: 11 },
  { name: 'LED Photo Frame', productType: 'led-photo-frame', sortOrder: 12 },
  { name: 'Photo Collage', productType: 'photo-collage', sortOrder: 13 },
  { name: 'Photo Clock', productType: 'photo-clock', sortOrder: 17 },
  { name: 'Canvas Print', productType: 'canvas-print', sortOrder: 14 },
  { name: 'God Photo Frame', productType: 'god-photo-frame', sortOrder: 15 },
  { name: 'T-Shirt Printing', productType: 't-shirt-printing', sortOrder: 16 },
];

const DEV_PRODUCTS = [
  {
    title: 'Premium Acrylic Wall Photo Portrait',
    slug: 'premium-acrylic-wall-photo-portrait',
    productType: 'acrylic-wall-photo',
    description: 'High gloss acrylic portrait print for Indian homes and gifting.',
    highlights: ['HD acrylic print', 'Ready to hang', 'Water resistant finish'],
    attributes: { size: ['8x12 inch', '12x18 inch'], material: ['3mm Acrylic', '5mm Acrylic'], frameType: ['No Frame', 'Dual Border'] },
    personalization: { allowPhotoUpload: true, maxPhotos: 1, allowText: true, textFields: ['caption'] },
    mockup: {
      canvas: { width: 1000, height: 1250 },
      photoBox: { x: 90, y: 80, width: 820, height: 1090, rotate: 0, borderRadius: 18 },
    },
    variants: [
      { sku: 'AWP-POR-8X12-3MM', size: '8x12 inch', material: '3mm Acrylic', frameType: 'No Frame', price: 699, compareAtPrice: 999, stock: 100, isActive: true },
      { sku: 'AWP-POR-12X18-5MM', size: '12x18 inch', material: '5mm Acrylic', frameType: 'Dual Border', price: 1299, compareAtPrice: 1899, stock: 75, isActive: true },
    ],
    isFeatured: true,
    isActive: true,
  },
  {
    title: 'Premium Leather Photo Album',
    slug: 'premium-leather-photo-album',
    productType: 'photo-album',
    description: 'Luxury leatherette photo album for weddings and family memories.',
    highlights: ['Hardbound cover', '30 pages', 'Gift box included'],
    attributes: { size: ['A4', 'A5'], material: ['Leatherette'], frameType: ['Hardbound'] },
    personalization: { allowPhotoUpload: true, maxPhotos: 6, allowText: true, textFields: ['title'] },
    mockup: { canvas: { width: 1000, height: 1250 }, photoBox: { x: 100, y: 120, width: 800, height: 600, borderRadius: 8 } },
    variants: [
      { sku: 'PAL-A4-30P', size: 'A4', material: 'Leatherette', frameType: 'Hardbound', price: 1499, compareAtPrice: 1999, stock: 40, isActive: true },
      { sku: 'PAL-A5-20P', size: 'A5', material: 'Leatherette', frameType: 'Hardbound', price: 999, compareAtPrice: 1399, stock: 55, isActive: true },
    ],
    isFeatured: true,
    isActive: true,
  },
  {
    title: 'Square Round Acrylic Photo Wall Clock',
    slug: 'square-round-acrylic-photo-wall-clock',
    productType: 'custom-wall-watch',
    description: 'Personalised wall clock with your favourite family photo.',
    highlights: ['Silent movement', 'Photo dial', 'Gift packaging'],
    attributes: { size: ['10 inch'], material: ['Acrylic'], frameType: ['Round'] },
    personalization: { allowPhotoUpload: true, maxPhotos: 1, allowText: false, textFields: [] },
    mockup: { canvas: { width: 1000, height: 1000 }, photoBox: { x: 160, y: 160, width: 680, height: 680, borderRadius: 340 } },
    variants: [{ sku: 'CWW-SQR-ROUND-10', size: '10 inch', material: 'Acrylic', frameType: 'Round', price: 899, compareAtPrice: 1299, stock: 60, isActive: true }],
    isFeatured: true,
    isActive: true,
  },
  {
    title: 'Four Photo Collage Wall Clock',
    slug: 'four-photo-collage-wall-clock',
    productType: 'custom-wall-watch',
    description: 'Four-photo collage clock with separate upload zones.',
    highlights: ['4 photo slots', 'Collage dial', 'Silent movement'],
    attributes: { size: ['12 inch'], material: ['Acrylic'], frameType: ['Collage'] },
    personalization: { allowPhotoUpload: true, maxPhotos: 3, allowText: false, textFields: [] },
    mockup: {
      canvas: { width: 1024, height: 1536 },
      frameImage: '/mockups/frame-collage.svg',
      photoBoxes: [
        { id: 1, x: 75, y: 95, width: 515, height: 550 },
        { id: 2, x: 300, y: 500, width: 530, height: 440 },
        { id: 3, x: 515, y: 940, width: 440, height: 390 },
      ],
    },
    variants: [{ sku: 'CWW-COLLAGE-12', size: '12 inch', material: 'Acrylic', frameType: 'Collage', price: 1199, compareAtPrice: 1699, stock: 45, isActive: true }],
    isFeatured: true,
    isActive: true,
  },
];

/** Storefront products that exist in frontend fallbackCatalog but may be missing from MongoDB */
const FALLBACK_STOREFRONT_PRODUCTS = [
  {
    title: 'Modern Acrylic House Name Plate',
    slug: 'modern-acrylic-house-name-plate',
    productType: 'acrylic-name-plate',
    description: 'Minimal name plate with premium acrylic layers and crisp typography.',
    highlights: ['Weather friendly', 'Custom text', 'Easy mounting'],
    images: ['/products/name-plate-live.png'],
    attributes: { size: ['12x6 inch'], material: ['5mm Acrylic'], frameType: ['Layered'] },
    personalization: { allowPhotoUpload: false, allowText: true, textFields: ['familyName', 'addressLine'] },
    mockup: {
      canvas: { width: 1000, height: 1000 },
      baseImageUrl: '/products/name-plate-live.png',
    },
    variants: [
      {
        sku: 'ANP-12X6',
        size: '12x6 inch',
        material: '5mm Acrylic',
        frameType: 'Layered',
        price: 1199,
        compareAtPrice: 1699,
        stock: 45,
        isActive: true,
      },
    ],
    isFeatured: false,
    isActive: true,
  },
  {
    title: 'Monogram Initial Acrylic Name Plate',
    slug: 'monogram-initial-acrylic-name-plate',
    productType: 'acrylic-monogram-nameplate',
    description: 'Elegant monogram name plate with layered acrylic finish.',
    highlights: ['Custom monogram', 'Weather friendly', 'Easy mounting'],
    images: [],
    attributes: { size: ['10x6 inch'], material: ['5mm Acrylic'], frameType: ['Layered'] },
    personalization: { allowPhotoUpload: false, allowText: true, textFields: ['monogram', 'familyName'] },
    mockup: { canvas: { width: 1000, height: 1000 } },
    variants: [
      {
        sku: 'AMN-10X6',
        size: '10x6 inch',
        material: '5mm Acrylic',
        frameType: 'Layered',
        price: 1099,
        compareAtPrice: 1499,
        stock: 35,
        isActive: true,
      },
    ],
    isFeatured: false,
    isActive: true,
  },
  {
    title: 'Modern Photo Wall Clock',
    slug: 'modern-photo-wall-clock',
    productType: 'photo-clock',
    description: 'A modern square photo clock combining timekeeping with your favourite memory.',
    highlights: ['Silent sweep movement', 'Sharp photo print', 'Easy wall mount'],
    images: [],
    attributes: { size: ['12 inch'], material: ['Acrylic'], frameType: ['Square'] },
    personalization: { allowPhotoUpload: true, maxPhotos: 1, allowText: false, textFields: [] },
    mockup: {
      canvas: { width: 1000, height: 1000 },
      photoBox: { x: 150, y: 150, width: 700, height: 700, rotate: 0, borderRadius: 20 },
    },
    defaultOptions: {
      shape: 'Square',
      clockHands: 'Classic Silver',
      size: '12 inch',
      dialStyle: 'Minimal Numbers',
      numberStyle: 'Modern',
      numberColor: '#ffffff',
    },
    variants: [
      {
        sku: 'PCL-SQ-12',
        size: '12 inch',
        material: 'Acrylic',
        frameType: 'Square',
        price: 949,
        compareAtPrice: 1349,
        stock: 55,
        isActive: true,
      },
    ],
    isFeatured: false,
    isActive: true,
  },
];

async function findCategoryForProductType(productType) {
  return (
    (await Category.findOne({ productType, parent: null }).sort('sortOrder')) ||
    (await Category.findOne({ productType }).sort('sortOrder'))
  );
}

/** Ensures all storefront homepage categories exist in MongoDB (runs every dev boot). */
export async function ensureDevCategories() {
  if (process.env.SEED_DEV_CATALOG === 'false') return;

  const isDev = process.env.NODE_ENV !== 'production';
  const useMemory = process.env.USE_MEMORY_MONGO === 'true';
  if (!isDev && !useMemory) return;

  let created = 0;
  for (const entry of DEV_HOMEPAGE_CATEGORIES) {
    const slug = slugify(entry.name, { lower: true, strict: true });
    const exists = await Category.findOne({ slug });
    if (exists) continue;

    await Category.create({
      name: entry.name,
      slug,
      productType: entry.productType,
      sortOrder: entry.sortOrder,
      isActive: true,
    });
    created += 1;
  }

  if (created > 0) {
    console.log(`Dev categories seeded (${created} new).`);
  }
}

export async function ensureDevCatalog() {
  if (process.env.SEED_DEV_CATALOG === 'false') return;

  const isDev = process.env.NODE_ENV !== 'production';
  const useMemory = process.env.USE_MEMORY_MONGO === 'true';
  if (!isDev && !useMemory) return;

  await ensureDevCategories();
  await ensureFallbackStorefrontProducts();

  for (const entry of DEV_PRODUCTS) {
    const exists = await Product.findOne({ slug: entry.slug });
    if (exists) continue;

    const category = await findCategoryForProductType(entry.productType);
    if (!category) {
      console.warn(`Skipping dev product "${entry.slug}" — no category for ${entry.productType}`);
      continue;
    }

    await Product.create({
      ...entry,
      category: category._id,
      images: [],
      seo: { title: entry.title, description: entry.description, keywords: [] },
    });
  }

  console.log(`Dev catalog seeded (${DEV_PRODUCTS.length} products).`);
}

/** Upsert fallback storefront products so /products/:slug works with real MongoDB IDs */
export async function ensureFallbackStorefrontProducts() {
  if (process.env.SEED_DEV_CATALOG === 'false') return;

  const isDev = process.env.NODE_ENV !== 'production';
  const useMemory = process.env.USE_MEMORY_MONGO === 'true';
  if (!isDev && !useMemory) return;

  let created = 0;
  for (const entry of FALLBACK_STOREFRONT_PRODUCTS) {
    const exists = await Product.findOne({ slug: entry.slug });
    if (exists) continue;

    const category = await findCategoryForProductType(entry.productType);
    if (!category) {
      console.warn(`Skipping fallback product "${entry.slug}" — no category for ${entry.productType}`);
      continue;
    }

    await Product.create({
      ...entry,
      category: category._id,
      seo: { title: entry.title, description: entry.description, keywords: [] },
    });
    created += 1;
  }

  if (created > 0) {
    console.log(`Fallback storefront products seeded (${created} new).`);
  }
}

export function isDemoProductId(id) {
  return !id || String(id).startsWith('demo-') || !mongoose.Types.ObjectId.isValid(String(id));
}
