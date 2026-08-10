import { User } from '../models/User.js';
import { ensureDevCatalog, ensureDevCategories, ensureFallbackStorefrontProducts } from './seedCatalog.js';

import { ensureHomeSlides } from './seedHomeSlides.js';
import { ensureProductReviews } from './seedProductReviews.js';
import { ensureCategoryCarousel } from './seedCategoryCarousel.js';
import { ensureProductReels } from './seedProductReels.js';
import { ensureCorporateGifts } from './seedCorporateGifts.js';
import { ensureBabyBirthFrames } from './seedBabyBirthFrames.js';
import { ensureTrophies } from './seedTrophies.js';
import { ensurePenPrints } from './seedPenPrints.js';
import { ensureUvDtfStickers } from './seedUvDtfStickers.js';
import { ensureProductLabelStickers } from './seedProductLabelStickers.js';
import { ensureStoreSettings } from './seedStoreSettings.js';
import { ensureGodProducts } from './seedGodProducts.js';
import { ensureNamePlateProducts } from './seedNamePlateProducts.js';

export {
  ensureDevCatalog,
  ensureDevCategories,
  ensureFallbackStorefrontProducts,
  ensureHomeSlides,
  ensureProductReviews,
  ensureCategoryCarousel,
  ensureProductReels,
  ensureStoreSettings,
  ensureCorporateGifts,
  ensureBabyBirthFrames,
  ensureTrophies,
  ensurePenPrints,
  ensureUvDtfStickers,
  ensureProductLabelStickers,
  ensureGodProducts,
  ensureNamePlateProducts,
};

const DEV_USERS = [
  {
    name: 'NamoPrint Admin',
    email: 'admin@omgs.com',
    phone: '9876543211',
    password: 'Admin@12345',
    role: 'admin',
  },
  {
    name: 'NamoPrint Admin (Local)',
    email: 'admin@omgs.local',
    phone: '9876543212',
    password: 'Admin@12345',
    role: 'admin',
  },
];

export async function ensureDevUsers() {
  if (process.env.SEED_DEV_USERS === 'false') return;

  const isDev = process.env.NODE_ENV !== 'production';
  const useMemory = process.env.USE_MEMORY_MONGO === 'true';
  if (!isDev && !useMemory) return;

  for (const entry of DEV_USERS) {
    const exists = await User.findOne({ email: entry.email });
    if (exists) continue;

    const user = new User({
      name: entry.name,
      email: entry.email,
      phone: entry.phone,
      role: entry.role,
    });
    user.password = entry.password;
    await user.save();
    if (entry.role === 'admin') {
      console.log(`Admin account ready: ${entry.email}`);
    }
  }
}
