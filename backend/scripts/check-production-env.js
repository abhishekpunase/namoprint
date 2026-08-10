/**
 * Validates production environment without starting the server.
 * Usage: NODE_ENV=production node scripts/check-production-env.js
 */
import '../src/config/env.js';

console.log('Production environment variables look valid.');
