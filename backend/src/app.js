import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.join(__dirname, '..', '..', 'frontend');
const frontendDist = path.join(frontendRoot, 'dist');
const hasFrontendDist = fs.existsSync(path.join(frontendDist, 'index.html'));

function resolveFrontendStatic(subPath) {
  const distPath = path.join(frontendDist, subPath);
  if (hasFrontendDist && fs.existsSync(distPath)) return distPath;
  return path.join(frontendRoot, 'public', subPath);
}

export const app = express();

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (env.clientUrls.includes(origin)) return true;
  if (env.nodeEnv !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return true;
  }
  return false;
};

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(env.cookieSecret));
app.use(mongoSanitize());
app.use(hpp());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders(res, filePath) {
    if (/\.(svg|png|jpe?g|webp|gif)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  },
}));
app.use('/mockups', express.static(resolveFrontendStatic('mockups'), { maxAge: '7d' }));
app.use('/products', express.static(resolveFrontendStatic('products'), { maxAge: '7d' }));
app.use('/api', apiLimiter, routes);

app.get('/health', async (_req, res) => {
  let db = 'disconnected';
  let ok = false;

  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      db = 'connected';
      ok = true;
    } catch {
      db = 'error';
    }
  }

  res.status(200).json({ ok, service: 'omgs-print-backend', db });
});

if (env.nodeEnv === 'production' && hasFrontendDist) {
  app.use(express.static(frontendDist, { index: false }));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/mockups') ||
      req.path.startsWith('/products') ||
      req.path === '/health'
    ) {
      next();
      return;
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else if (env.nodeEnv === 'production') {
  console.warn('WARNING: frontend/dist/index.html missing — SPA routes will 404 until frontend is built.');
}

app.use(notFound);
app.use(errorHandler);
