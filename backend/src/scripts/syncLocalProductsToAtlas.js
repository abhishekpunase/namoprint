import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { PERSISTENT_DEV_DB_PATH } from '../config/db.js';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const DEV_MONGO_PORT = Number(process.env.DEV_MONGO_PORT || 27027);
const LOCAL_URI = `mongodb://127.0.0.1:${DEV_MONGO_PORT}/printingwatch`;
const ATLAS_URI = process.env.MONGO_URI;

if (!ATLAS_URI || !ATLAS_URI.includes('mongodb')) {
  console.error('MONGO_URI missing in backend/.env');
  process.exit(1);
}

async function connectLocal() {
  // Prefer already-running local instance; otherwise start persistent memory server
  try {
    await mongoose.connect(LOCAL_URI, {
      serverSelectionTimeoutMS: 3000,
      directConnection: true,
      family: 4,
    });
    console.log('Connected to local MongoDB');
    return null;
  } catch {
    console.log('Starting local persistent MongoDB…');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create({
      instance: { dbPath: PERSISTENT_DEV_DB_PATH, port: DEV_MONGO_PORT },
      startTimeout: 120000,
    });
    await mongoose.connect(LOCAL_URI, {
      serverSelectionTimeoutMS: 15000,
      directConnection: true,
      family: 4,
    });
    console.log('Connected to local MongoDB (started)');
    return memoryServer;
  }
}

async function connectAtlas() {
  await mongoose.disconnect().catch(() => {});
  await mongoose.connect(ATLAS_URI, {
    serverSelectionTimeoutMS: 20000,
    family: 4,
  });
  console.log('Connected to Atlas');
}

function stripMeta(doc) {
  const obj = { ...doc };
  delete obj.__v;
  return obj;
}

const run = async () => {
  let memoryServer = null;
  try {
    memoryServer = await connectLocal();

    const categories = await Category.find({}).lean();
    const products = await Product.find({}).lean();
    console.log(`Local export: ${categories.length} categories, ${products.length} products`);

    if (!products.length) {
      console.error('No local products to sync.');
      process.exit(1);
    }

    await connectAtlas();

    let catUpserted = 0;
    for (const cat of categories) {
      const payload = stripMeta(cat);
      await Category.updateOne({ _id: payload._id }, { $set: payload }, { upsert: true });
      catUpserted += 1;
    }

    let prodUpserted = 0;
    let prodBySlug = 0;
    for (const product of products) {
      const payload = stripMeta(product);
      try {
        await Product.updateOne({ _id: payload._id }, { $set: payload }, { upsert: true });
        prodUpserted += 1;
      } catch (err) {
        // Fallback if _id collision with different slug unique index issues
        if (err?.code === 11000) {
          await Product.updateOne({ slug: payload.slug }, { $set: { ...payload, _id: undefined } }, { upsert: true });
          prodBySlug += 1;
        } else {
          throw err;
        }
      }
    }

    const atlasActive = await Product.countDocuments({ isActive: true });
    const atlasTotal = await Product.countDocuments();
    console.log(`Synced categories: ${catUpserted}`);
    console.log(`Synced products: ${prodUpserted} by id, ${prodBySlug} by slug`);
    console.log(`Atlas now has ${atlasTotal} products (${atlasActive} active)`);
  } finally {
    await mongoose.disconnect().catch(() => {});
    if (memoryServer) {
      await memoryServer.stop().catch(() => {});
    }
  }
};

run().catch(async (err) => {
  console.error('Sync failed:', err?.message || err);
  if (String(err?.message || '').includes('whitelist') || String(err?.message || '').includes('ECONNREFUSED') || String(err?.message || '').includes('querySrv')) {
    console.error('\nAtlas tip: MongoDB Atlas → Network Access → Add IP Address (your current IP or 0.0.0.0/0 for dev).');
  }
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
