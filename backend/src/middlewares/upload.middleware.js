import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/svg+xml'];
const allowedVideoMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxImageMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageMimeTypes.includes(file.mimetype)) {
      cb(new ApiError(415, 'Only JPEG, PNG, WEBP, SVG, HEIC images are allowed'));
      return;
    }
    cb(null, true);
  }
});

export const uploadDesign = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxImageMb * 1024 * 1024 * 2 },
  fileFilter: (_req, file, cb) => {
    const blocked = ['application/x-msdownload', 'application/x-executable', 'application/x-msdos-program'];
    if (blocked.includes(file.mimetype)) {
      cb(new ApiError(415, 'Executable files are not allowed'));
      return;
    }
    cb(null, true);
  },
});

export const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxVideoMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedVideoMimeTypes.includes(file.mimetype)) {
      cb(new ApiError(415, 'Only MP4, WEBM, or MOV videos are allowed'));
      return;
    }
    cb(null, true);
  },
});
