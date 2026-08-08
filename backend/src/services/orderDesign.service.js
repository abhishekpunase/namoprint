import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { UploadAsset } from '../models/UploadAsset.js';
import { ApiError } from '../utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

/** Parse "8x10", "8×10 inch", "8-10 inch", "8-10-INCH" → pixel size at DPI */
export function parsePrintSizePixels(sizeLabel, dpi = 300) {
  const raw = String(sizeLabel || '8x6');
  const match = raw.match(/(\d+(?:\.\d+)?)\s*(?:[x×]|[-–])\s*(\d+(?:\.\d+)?)/i);
  const wIn = match ? parseFloat(match[1]) : 8;
  const hIn = match ? parseFloat(match[2]) : 6;

  return {
    widthPx: Math.round(wIn * dpi),
    heightPx: Math.round(hIn * dpi),
    dpi,
    widthIn: wIn,
    heightIn: hIn,
    label: `${wIn}×${hIn} in @ ${dpi} DPI`,
  };
}

export function resolveOrderSizeLabel(item) {
  const customization = item?.customization || {};
  const variant = item?.variantSnapshot || {};

  return (
    customization.size ||
    customization.options?.size ||
    customization.qualityLabel ||
    variant.size ||
    variant.label ||
    '8x6'
  );
}

export async function loadImageBuffer(url) {
  if (!url) throw new ApiError(404, 'Design image URL missing');

  const resolved = String(url).trim();

  if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
    const response = await fetch(resolved);
    if (!response.ok) throw new ApiError(502, 'Could not fetch design image');
    return Buffer.from(await response.arrayBuffer());
  }

  const key = resolved.includes('/uploads/')
    ? resolved.split('/uploads/').pop().split('?')[0]
    : resolved.replace(/^\/+/, '');

  const filePath = path.join(uploadDir, key.replaceAll('/', path.sep));
  return fs.readFile(filePath);
}

export async function resolveOrderItemDesignSource(item) {
  if (item.productionFileUrl) {
    return { url: item.productionFileUrl, kind: 'production' };
  }

  const customization = item.customization || {};

  if (customization.designImageUrl) {
    return { url: customization.designImageUrl, kind: 'design' };
  }

  if (customization.previewUrl && !String(customization.previewUrl).startsWith('blob:')) {
    return { url: customization.previewUrl, kind: 'preview' };
  }

  const assetId =
    customization.slotPhotos?.[0]?.asset ||
    customization.photos?.[0]?.asset ||
    customization.assetId;

  if (assetId && mongoose.Types.ObjectId.isValid(assetId)) {
    const asset = await UploadAsset.findById(assetId);
    if (asset?.url) {
      return {
        url: asset.url,
        kind: 'print',
        width: asset.width,
        height: asset.height,
      };
    }
  }

  return null;
}

export function resolveTShirtAssetUrl(item, assetType) {
  const customization = item?.customization || {};
  if (assetType === 'logo') {
    return customization.logoUrl || customization.previewUrl || '';
  }
  if (customization.productImageUrl) return customization.productImageUrl;
  const populated = item.tShirtProduct;
  if (populated?.images?.[0]) return populated.images[0];
  return '';
}

/**
 * Export full design JPEG at print DPI — entire image preserved, never cropped.
 * Scales to fit inside the ordered print size (letterbox-free output dimensions).
 */
export async function exportOrderItemDesignJpeg({ item, dpi = 300 }) {
  const source = await resolveOrderItemDesignSource(item);
  if (!source?.url) throw new ApiError(404, 'No customer design found for this item');

  const sizeLabel = resolveOrderSizeLabel(item);
  const { widthPx, heightPx } = parsePrintSizePixels(sizeLabel, dpi);
  const input = await loadImageBuffer(source.url);

  const base = sharp(input, { failOn: 'none' }).rotate();
  const meta = await base.metadata();
  const srcW = Math.max(1, meta.width || 1);
  const srcH = Math.max(1, meta.height || 1);

  // Fit entire image inside print bounds — no cover/crop
  const scale = Math.min(widthPx / srcW, heightPx / srcH);
  const outW = Math.max(1, Math.round(srcW * scale));
  const outH = Math.max(1, Math.round(srcH * scale));

  return base
    .resize(outW, outH, {
      kernel: sharp.kernel.lanczos3,
    })
    .jpeg({ quality: 95, mozjpeg: true })
    .withMetadata({ density: dpi })
    .toBuffer();
}
