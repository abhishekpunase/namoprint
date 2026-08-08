import dns from 'dns';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { env } from './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Local disk folder — users/orders persist here across server restarts (dev fallback). */
export const PERSISTENT_DEV_DB_PATH = path.resolve(__dirname, '../../.data/mongo');

const DEV_MONGO_PORT = Number(process.env.DEV_MONGO_PORT || 27027);
const DEV_MONGO_URI = `mongodb://127.0.0.1:${DEV_MONGO_PORT}/printingwatch`;

let memoryServer = null;

const connectOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4,
};

function maskUri(uri = '') {
  return typeof uri === 'string' ? uri.replace(/\/\/.*@/, '//<credentials>@') : uri;
}

function printAtlasHelp() {
  console.error('\n--- MongoDB Atlas fix (choose one) ---');
  console.error('1) Atlas Dashboard → Network Access → Add IP Address');
  console.error('   Use "Add Current IP Address" or allow 0.0.0.0/0 for development.');
  console.error('2) Persistent local dev DB (automatic):');
  console.error(`   Data folder: ${PERSISTENT_DEV_DB_PATH}`);
  console.error('3) Install local MongoDB and set:');
  console.error('   MONGO_URI=mongodb://127.0.0.1:27017/printingwatch');
  console.error('--------------------------------------\n');
}

/** Dev only — recover from crashed mongod leaving mongod.lock behind */
function tryClearStaleLock(dbPath) {
  const lockFile = path.join(dbPath, 'mongod.lock');
  if (!fs.existsSync(lockFile)) return;
  try {
    fs.unlinkSync(lockFile);
    console.warn('Removed stale mongod.lock (previous dev DB did not shut down cleanly)');
  } catch {
    /* another live mongod holds the lock — do not delete */
  }
}

/** Connect to an already-running local dev mongod (e.g. after nodemon restart). */
async function tryReuseDevMongo() {
  if (mongoose.connection.readyState === 1) return true;
  try {
    await mongoose.connect(DEV_MONGO_URI, { ...connectOptions, serverSelectionTimeoutMS: 4000 });
    console.log('MongoDB connected (reused running local dev instance)');
    console.log(`User data saved on disk: ${PERSISTENT_DEV_DB_PATH}`);
    return true;
  } catch {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    return false;
  }
}

async function startPersistentDevMongo(retryOnLock = true) {
  fs.mkdirSync(PERSISTENT_DEV_DB_PATH, { recursive: true });

  if (await tryReuseDevMongo()) return;

  const { MongoMemoryServer } = await import('mongodb-memory-server');

  const createServer = () =>
    MongoMemoryServer.create({
      instance: {
        dbPath: PERSISTENT_DEV_DB_PATH,
        port: DEV_MONGO_PORT,
      },
      startTimeout: 60000,
    });

  try {
    memoryServer = await createServer();
  } catch (err) {
    const lockBusy =
      String(err?.message || err).includes('DBPathInUse') ||
      String(err?.message || err).includes('lock file');

    if (lockBusy && (await tryReuseDevMongo())) return;

    if (retryOnLock && lockBusy) {
      tryClearStaleLock(PERSISTENT_DEV_DB_PATH);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      try {
        memoryServer = await createServer();
      } catch (retryErr) {
        if (await tryReuseDevMongo()) return;
        throw retryErr;
      }
    } else {
      throw err;
    }
  }

  await mongoose.connect(DEV_MONGO_URI, connectOptions);
  console.log('MongoDB connected (persistent local dev database)');
  console.log(`User data saved on disk: ${PERSISTENT_DEV_DB_PATH}`);
}

export const connectDb = async () => {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  mongoose.set('strictQuery', true);

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (process.env.USE_MEMORY_MONGO === 'true') {
    await startPersistentDevMongo();
    return;
  }

  try {
    await mongoose.connect(env.mongoUri, connectOptions);
    console.log('MongoDB connected (Atlas / cloud)');
    return;
  } catch (err) {
    console.error('MongoDB connection failed for', maskUri(env.mongoUri));
    console.error(err?.message || err);

    if (env.nodeEnv !== 'development') {
      printAtlasHelp();
      throw err;
    }

    console.warn('Using persistent local dev database (data survives server restarts)…');
    try {
      await startPersistentDevMongo();
      console.warn('Tip: whitelist your IP on Atlas, then set USE_MEMORY_MONGO=false for cloud DB.');
      return;
    } catch (fallbackErr) {
      console.error('Persistent local dev database failed:', fallbackErr?.message || fallbackErr);
      printAtlasHelp();
      throw fallbackErr;
    }
  }
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
