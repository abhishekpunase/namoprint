import 'dotenv/config';
import { connectDb, disconnectDb } from '../config/db.js';
import { ensureDevCategories, ensureFallbackStorefrontProducts } from '../config/seedCatalog.js';

const run = async () => {
  await connectDb();
  await ensureDevCategories();
  await ensureFallbackStorefrontProducts();
  await disconnectDb();
  console.log('Fallback storefront products are up to date.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
