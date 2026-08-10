import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const WEAK_SECRET_PATTERN = /change_this|dev_|^test|^secret$/i;

function assertProductionSecret(name, value) {
  const trimmed = String(value || '').trim();
  if (trimmed.length < 32) {
    throw new Error(`${name} must be at least 32 characters in production`);
  }
  if (WEAK_SECRET_PATTERN.test(trimmed)) {
    throw new Error(`${name} must be changed from default/dev placeholder in production`);
  }
}

const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

if (isProduction) {
  const productionRequired = ['COOKIE_SECRET', 'CLIENT_URL', 'LOCAL_UPLOAD_PUBLIC_URL', 'API_BASE_URL'];
  for (const key of productionRequired) {
    if (!process.env[key]?.trim()) {
      throw new Error(`Missing required production env variable: ${key}`);
    }
  }

  assertProductionSecret('JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET);
  assertProductionSecret('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET);
  assertProductionSecret('COOKIE_SECRET', process.env.COOKIE_SECRET);

  if (process.env.USE_MEMORY_MONGO === 'true') {
    throw new Error('USE_MEMORY_MONGO must be false in production — use MongoDB Atlas or a managed MongoDB service');
  }

  if (/localhost|127\.0\.0\.1/i.test(process.env.LOCAL_UPLOAD_PUBLIC_URL || '')) {
    throw new Error('LOCAL_UPLOAD_PUBLIC_URL must use your public domain in production');
  }

  if (/localhost|127\.0\.0\.1/i.test(process.env.API_BASE_URL || '')) {
    throw new Error('API_BASE_URL must use your public domain in production');
  }

  if (!/^https:\/\//i.test(process.env.CLIENT_URL?.split(',')[0] || '')) {
    console.warn('WARNING: CLIENT_URL should use https:// in production for secure cookies and CORS.');
  }
}

const parseClientUrls = () =>
  (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 5000),
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  clientUrl: parseClientUrls()[0] || 'http://localhost:5173',
  clientUrls: parseClientUrls(),
  passwordResetUrl: process.env.PASSWORD_RESET_URL || 'http://localhost:5173/reset-password',
  mongoUri: process.env.MONGO_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '8h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  adminSetupSecret: process.env.ADMIN_SETUP_SECRET,
  cookieSecret: process.env.COOKIE_SECRET || 'dev_cookie_secret',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 200),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  uploadRateLimitMax: Number(process.env.UPLOAD_RATE_LIMIT_MAX || 40),
  maxImageMb: Number(process.env.MAX_IMAGE_MB || 25),
  maxVideoMb: Number(process.env.MAX_VIDEO_MB || 50),
  localUploadPublicUrl: process.env.LOCAL_UPLOAD_PUBLIC_URL || 'http://localhost:5000/uploads',
  aws: {
    region: process.env.AWS_REGION || 'ap-south-1',
    bucket: process.env.AWS_S3_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
  },
  shiprocket: {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
    baseUrl: process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external',
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || '',
    weight: Number(process.env.SHIPROCKET_DEFAULT_WEIGHT_KG || 0.5),
    length: Number(process.env.SHIPROCKET_DEFAULT_LENGTH_CM || 20),
    breadth: Number(process.env.SHIPROCKET_DEFAULT_BREADTH_CM || 15),
    height: Number(process.env.SHIPROCKET_DEFAULT_HEIGHT_CM || 5),
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'OMGS <no-reply@omgs.in>'
  }
};
