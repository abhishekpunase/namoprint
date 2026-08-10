import { app } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';
import { shouldSeedDemoContent } from './config/seedGuard.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ensureDevUsers,
  ensureDevCatalog,
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
  ensureHomeTestimonials,
  ensureHomeOfferMarquee,
} from './config/seedDev.js';

async function runStartupSeed(label, fn) {
  try {
    await fn();
  } catch (err) {
    console.warn(`${label} seed skipped:`, err?.message || err);
  }
}

const start = async () => {
  await connectDb();
  await ensureStoreSettings();

  if (shouldSeedDemoContent()) {
    await runStartupSeed('Dev users', ensureDevUsers);
    await runStartupSeed('Dev catalog', ensureDevCatalog);
    await runStartupSeed('Home slides', ensureHomeSlides);
    await runStartupSeed('Product reviews', ensureProductReviews);
    await runStartupSeed('Category carousel', ensureCategoryCarousel);
    await runStartupSeed('Product reels', ensureProductReels);
    await runStartupSeed('Corporate gifts', ensureCorporateGifts);
    await runStartupSeed('Baby birth frames', ensureBabyBirthFrames);
    await runStartupSeed('Trophies', ensureTrophies);
    await runStartupSeed('Pen prints', ensurePenPrints);
    await runStartupSeed('UV DTF stickers', ensureUvDtfStickers);
    await runStartupSeed('Product label stickers', ensureProductLabelStickers);
    await runStartupSeed('Home testimonials', ensureHomeTestimonials);
    await runStartupSeed('Home offer marquee', ensureHomeOfferMarquee);
  } else if (env.isProduction) {
    console.log('Production mode: demo seeds skipped (set SEED_ON_START=true to override).');
  }

  const server = await listenWithRetry(app, env.port);

  const shutdown = async (label, { exitAfter = true } = {}) => {
    console.log(`\n${label} — closing server and database…`);
    await new Promise((resolve) => server.close(resolve));
    await disconnectDb();
    if (exitAfter) process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGUSR2', async () => {
    await shutdown('SIGUSR2 (nodemon restart)', { exitAfter: false });
    process.kill(process.pid, 'SIGUSR2');
  });

  const host = env.isProduction ? env.apiBaseUrl : `http://localhost:${env.port}`;
  console.log(`API running on ${host}`);
  if (env.isProduction) {
    console.log('Production mode: demo seeds disabled, SPA served from frontend/dist');
  } else {
    console.log(`Admin login: admin@omgs.com (see seed logs for password)`);
  }
  if (env.isProduction) {
    const frontendDist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'frontend', 'dist');
    if (!fs.existsSync(path.join(frontendDist, 'index.html'))) {
      console.warn('WARNING: frontend/dist not found — run "npm run build" in frontend before production start.');
    }
  }
};

function listenWithRetry(appInstance, port, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryListen = () => {
      attempt += 1;
      const server = appInstance.listen(port);

      server.once('listening', () => resolve(server));

      server.once('error', (err) => {
        server.close?.();

        if (err.code === 'EADDRINUSE' && attempt < maxAttempts) {
          console.warn(`Port ${port} busy, retrying (${attempt}/${maxAttempts})…`);
          setTimeout(tryListen, 1000);
          return;
        }

        if (err.code === 'EADDRINUSE') {
          console.error(`\nPort ${port} is still in use after ${maxAttempts} attempts.`);
          console.error('Fix (PowerShell):');
          console.error(`  netstat -ano | findstr :${port}`);
          console.error('  taskkill /PID <PID> /F');
          console.error('\nOr run: npm run dev:clean\n');
        }

        reject(err);
      });
    };

    tryListen();
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
