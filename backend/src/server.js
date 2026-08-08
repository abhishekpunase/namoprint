import { app } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';
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
} from './config/seedDev.js';

const start = async () => {
  await connectDb();
  await ensureDevUsers();
  await ensureDevCatalog();
  await ensureHomeSlides();
  await ensureProductReviews();
  await ensureCategoryCarousel();
  await ensureProductReels();
  await ensureStoreSettings();
  await ensureCorporateGifts();
  await ensureBabyBirthFrames();
  await ensureTrophies();
  await ensurePenPrints();
  await ensureUvDtfStickers();
  await ensureProductLabelStickers();

  const server = app.listen(env.port);

  const shutdown = async (label) => {
    console.log(`\n${label} — closing server and database…`);
    await new Promise((resolve) => server.close(resolve));
    await disconnectDb();
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGUSR2', async () => {
    await disconnectDb();
    process.kill(process.pid, 'SIGUSR2');
  });

  server.on('listening', () => {
    console.log(`API running on http://localhost:${env.port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\nPort ${env.port} is already in use.`);
      console.error('Fix (PowerShell):');
      console.error(`  netstat -ano | findstr :${env.port}`);
      console.error('  taskkill /PID <PID> /F');
      console.error('\nOr run: npm run dev:clean\n');
      process.exit(1);
    }
    throw err;
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
