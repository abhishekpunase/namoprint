/** Shared guard — demo/catalog seeds must not run in production unless explicitly enabled. */
export function shouldSeedDemoContent() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.SEED_ON_START === 'true';
  }
  if (process.env.SEED_ON_START === 'false') return false;
  if (process.env.SEED_DEV_USERS === 'false' && process.env.SEED_DEV_CATALOG === 'false') {
    return false;
  }
  return true;
}
