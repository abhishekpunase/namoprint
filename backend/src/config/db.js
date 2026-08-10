import dns from 'dns';
import fs from 'fs';
import net from 'net';
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

const devConnectOptions = {
  ...connectOptions,
  directConnection: true,
  maxPoolSize: 10,
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isDevMongoPortOpen(timeoutMs = 2000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port: DEV_MONGO_PORT });
    const done = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    setTimeout(() => done(false), timeoutMs);
  });
}

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

async function verifyMongoPing() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected');
  }
  await mongoose.connection.db.admin().ping();
}

/** Connect to an already-running local dev mongod (e.g. after nodemon restart). */
async function tryReuseDevMongo(attempts = 4, options = devConnectOptions) {
  if (mongoose.connection.readyState === 1) return true;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await mongoose.connect(DEV_MONGO_URI, {
        ...options,
        serverSelectionTimeoutMS: 8000,
      });
      console.log('MongoDB connected (reused running local dev instance)');
      console.log(`User data saved on disk: ${PERSISTENT_DEV_DB_PATH}`);
      return true;
    } catch {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => {});
      }
      if (attempt < attempts - 1) {
        await sleep(1000);
      }
    }
  }

  return false;
}

async function startPersistentDevMongo() {
  fs.mkdirSync(PERSISTENT_DEV_DB_PATH, { recursive: true });

  for (let round = 0; round < 40; round += 1) {
    if (await tryReuseDevMongo(3)) {
      await verifyMongoPing();
      return;
    }
    if (await isDevMongoPortOpen()) {
      await sleep(2000);
      continue;
    }
    break;
  }

  if (mongoose.connection.readyState === 1) return;

  if (await isDevMongoPortOpen()) {
    throw new Error(
      'Local MongoDB is running but the API could not connect. Close all backend terminals, wait 5 seconds, then run: npm run dev',
    );
  }

  tryClearStaleLock(PERSISTENT_DEV_DB_PATH);
  await sleep(1500);

  const { MongoMemoryServer } = await import('mongodb-memory-server');

  try {
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbPath: PERSISTENT_DEV_DB_PATH,
        port: DEV_MONGO_PORT,
      },
      startTimeout: 120000,
    });
  } catch (err) {
    const lockBusy =
      String(err?.message || err).includes('DBPathInUse') ||
      String(err?.message || err).includes('lock file');

    if (lockBusy && (await isDevMongoPortOpen())) {
      for (let i = 0; i < 20; i += 1) {
        if (await tryReuseDevMongo(3)) {
          await verifyMongoPing();
          return;
        }
        await sleep(2000);
      }
    }

    throw new Error(
      'Could not start local MongoDB. Close other backend terminals and run: npm run dev',
    );
  }

  await mongoose.connect(DEV_MONGO_URI, devConnectOptions);
  console.log('MongoDB connected (persistent local dev database)');
  console.log(`User data saved on disk: ${PERSISTENT_DEV_DB_PATH}`);
  await verifyMongoPing();
}

function isDockerRuntime() {
  try {
    return fs.existsSync('/.dockerenv');
  } catch {
    return false;
  }
}

function shouldUseMemoryMongo() {
  if (process.env.USE_MEMORY_MONGO !== 'true') return false;
  if (env.nodeEnv === 'production') {
    console.warn('USE_MEMORY_MONGO is ignored in production — using MONGO_URI.');
    return false;
  }
  if (isDockerRuntime()) {
    console.warn(
      'USE_MEMORY_MONGO is disabled in Docker — set MONGO_URI to Atlas or a Mongo service.',
    );
    return false;
  }
  return true;
}

async function connectCloudMongo() {
  await mongoose.connect(env.mongoUri, connectOptions);
  console.log('MongoDB connected (Atlas / cloud)');
  await verifyMongoPing();
}

export const connectDb = async () => {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  mongoose.set('strictQuery', true);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => {});
  }

  if (shouldUseMemoryMongo()) {
    await startPersistentDevMongo();
    return;
  }

  try {
    await connectCloudMongo();
    return;
  } catch (err) {
    console.error('MongoDB connection failed for', maskUri(env.mongoUri));
    console.error(err?.message || err);

    if (env.nodeEnv !== 'development' || isDockerRuntime()) {
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
  await mongoose.disconnect().catch(() => {});
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
