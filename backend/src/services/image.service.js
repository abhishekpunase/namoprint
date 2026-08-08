import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { putBuffer } from './storage.service.js';

const extensionFor = (format) => (format === 'jpeg' ? 'jpg' : format);

export const optimizeCustomerImage = async ({ file, userId }) => {
  if (file.mimetype === 'image/svg+xml') {
    const id = nanoid(18);
    const prefix = `mockup-uploads/${userId || 'admin'}/${id}`;
    const store = await putBuffer({
      key: `${prefix}/mockup.svg`,
      buffer: file.buffer,
      contentType: 'image/svg+xml',
    });
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      width: 1000,
      height: 1000,
      storage: store.storage,
      key: store.key,
      url: store.url,
      optimizedKey: store.key,
      optimizedUrl: store.url,
    };
  }

  const image = sharp(file.buffer, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();

  const format = metadata.hasAlpha ? 'png' : 'jpeg';
  const optimized = await image
    .resize({ width: 6000, height: 6000, fit: 'inside', withoutEnlargement: true })
    .toFormat(format, format === 'jpeg' ? { quality: 92, mozjpeg: true } : { compressionLevel: 8 })
    .toBuffer();

  const preview = await sharp(optimized)
    .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const id = nanoid(18);
  const prefix = `customer-uploads/${userId || 'guest'}/${id}`;
  const originalStore = await putBuffer({
    key: `${prefix}/print.${extensionFor(format)}`,
    buffer: optimized,
    contentType: format === 'jpeg' ? 'image/jpeg' : 'image/png'
  });
  const previewStore = await putBuffer({
    key: `${prefix}/preview.webp`,
    buffer: preview,
    contentType: 'image/webp'
  });

  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const dpiWarning =
    width < 1200 || height < 1200
      ? 'Image resolution may be low for large print sizes. Ask customer for a higher quality photo.'
      : undefined;

  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    width,
    height,
    dpiWarning,
    storage: originalStore.storage,
    key: originalStore.key,
    url: originalStore.url,
    optimizedKey: previewStore.key,
    optimizedUrl: previewStore.url
  };
};

export const buildPreviewPayload = ({ product, asset, crop }) => ({
  product: {
    id: product._id,
    title: product.title,
    mockup: product.mockup
  },
  photo: {
    assetId: asset._id,
    originalUrl: asset.url,
    previewUrl: asset.optimizedUrl || asset.url,
    crop: crop || asset.crop
  },
  renderInstructions: {
    canvas: product.mockup?.canvas || { width: 1000, height: 1000 },
    photoBox: product.mockup?.photoBox || { x: 0, y: 0, width: 1, height: 1, rotate: 0 },
    layers: [
      { type: 'image', role: 'base', url: product.mockup?.baseImageUrl },
      { type: 'customer-photo', url: asset.optimizedUrl || asset.url, crop: crop || asset.crop },
      { type: 'image', role: 'overlay', url: product.mockup?.overlayImageUrl }
    ].filter((layer) => layer.url || layer.type === 'customer-photo')
  }
});
