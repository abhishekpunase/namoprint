import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { UploadAsset } from '../models/UploadAsset.js';
import { buildPreviewPayload, optimizeCustomerImage } from '../services/image.service.js';
import { storeUploadedDesign, storeUploadedVideo } from '../services/media.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadCustomerPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Photo is required');

  const data = await optimizeCustomerImage({ file: req.file, userId: req.user?._id });
  const asset = await UploadAsset.create({ ...data, user: req.user?._id });

  res.status(201).json({ success: true, asset });
});

export const uploadDesignFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Design file is required');

  const data = await storeUploadedDesign({ file: req.file, userId: req.user?._id });
  const asset = await UploadAsset.create({ ...data, user: req.user?._id });

  res.status(201).json({ success: true, asset });
});

export const uploadAdminVideo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Video file is required');

  const data = await storeUploadedVideo({ file: req.file, userId: req.user?._id });
  const asset = await UploadAsset.create({ ...data, user: req.user?._id });

  res.status(201).json({ success: true, asset });
});

export const previewProductPhoto = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.productId) || !mongoose.Types.ObjectId.isValid(req.body.assetId)) {
    throw new ApiError(400, 'Preview not available for this product yet.');
  }

  const [product, asset] = await Promise.all([
    Product.findById(req.body.productId),
    UploadAsset.findById(req.body.assetId)
  ]);

  if (!product) throw new ApiError(404, 'Product not found');
  if (!asset) throw new ApiError(404, 'Upload asset not found');

  if (req.body.crop) {
    asset.crop = req.body.crop;
    await asset.save();
  }

  res.json({
    success: true,
    preview: buildPreviewPayload({ product, asset, crop: req.body.crop })
  });
});
