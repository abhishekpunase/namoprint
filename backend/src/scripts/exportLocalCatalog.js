import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { PERSISTENT_DEV_DB_PATH } from '../config/db.js';

const DEV_MONGO_PORT = Number(process.env.DEV_MONGO_PORT || 27027);
const LOCAL_URI = `mongodb://127.0.0.1:${DEV_MONGO_PORT}/printingwatch`;
const OUT_DIR = path.resolve(process.cwd(), '.data/exports');

async function connectLocal() {
  try {
    await mongoose.connect(LOCAL_URI, {
      serverSelectionTimeoutMS: 3000,
      directConnection: true,
      family: 4,
    });
    return null;
  } catch {
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
    return memoryServer;
  }
}

const memoryServer = await connectLocal();
const categories = await Category.find({}).lean();
const products = await Product.find({}).lean();

fs.mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `local-catalog-${Date.now()}.json`);
fs.writeFileSync(outFile, JSON.stringify({ exportedAt: new Date().toISOString(), categories, products }, null, 2));

console.log(`Exported ${categories.length} categories + ${products.length} products`);
console.log(`File: ${outFile}`);

await mongoose.disconnect().catch(() => {});
if (memoryServer) await memoryServer.stop().catch(() => {});
