import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
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
    baseUrl: process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external'
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
