import { nanoid } from 'nanoid';
import { putBuffer } from './storage.service.js';

const extensionForVideo = (mimeType) => {
  if (mimeType === 'video/webm') return 'webm';
  if (mimeType === 'video/quicktime') return 'mov';
  return 'mp4';
};

const safeExtension = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  return ext || 'bin';
};

export const storeUploadedDesign = async ({ file, userId }) => {
  const id = nanoid(18);
  const ext = safeExtension(file.originalname);
  const prefix = `design-uploads/${userId || 'customer'}/${id}`;
  const store = await putBuffer({
    key: `${prefix}/design.${ext}`,
    buffer: file.buffer,
    contentType: file.mimetype || 'application/octet-stream',
  });

  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    storage: store.storage,
    key: store.key,
    url: store.url,
    optimizedKey: store.key,
    optimizedUrl: store.url,
  };
};

export const storeUploadedVideo = async ({ file, userId }) => {
  const id = nanoid(18);
  const ext = extensionForVideo(file.mimetype);
  const prefix = `category-videos/${userId || 'admin'}/${id}`;
  const store = await putBuffer({
    key: `${prefix}/video.${ext}`,
    buffer: file.buffer,
    contentType: file.mimetype,
  });

  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    storage: store.storage,
    key: store.key,
    url: store.url,
    optimizedKey: store.key,
    optimizedUrl: store.url,
  };
};
