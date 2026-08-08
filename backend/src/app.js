import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
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

export const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(compression());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(env.cookieSecret));
app.use(mongoSanitize());
app.use(hpp());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(
  '/mockups',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'public', 'mockups')),
);
app.use(
  '/products',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'public', 'products')),
);
app.use('/api', apiLimiter, routes);
app.get('/health', (_req, res) => res.json({ ok: true, service: 'omgs-print-backend' }));
app.use(notFound);
app.use(errorHandler);
