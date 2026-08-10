import { GodOrder } from '../models/GodOrder.js';
import { GodProduct } from '../models/GodProduct.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate } from '../utils/uniqueSlug.js';

// ---------- Public: catalog ----------

export const listGodProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    GodProduct.find(filter).sort('sortOrder -createdAt').skip(skip).limit(limit),
    GodProduct.countDocuments(filter)
  ]);

  res.set('Cache-Control', 'no-store');
  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const getGodProduct = asyncHandler(async (req, res) => {
  const product = await GodProduct.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new ApiError(404, 'God photo frame not found');
  res.json({ success: true, product });
});

// ---------- Public: quick order ----------

export const createGodOrder = asyncHandler(async (req, res) => {
  const product = await GodProduct.findById(req.body.godProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

  const option = product.qualityOptions.id(req.body.qualityOptionId);
  if (!option || !option.isActive) throw new ApiError(404, 'Selected quality option not found');
  if (option.stock < req.body.quantity) throw new ApiError(409, 'Selected quantity is out of stock');

  const order = await GodOrder.create({
    godProduct: product._id,
    productTitle: product.title,
    qualityLabel: option.label,
    unitPrice: option.price,
    quantity: req.body.quantity,
    totalPrice: option.price * req.body.quantity,
    customerName: req.body.customerName,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
    notes: req.body.notes
  });

  res.status(201).json({ success: true, order });
});

// ---------- Admin: catalog CRUD ----------

export const adminListGodProducts = asyncHandler(async (req, res) => {
  const items = await GodProduct.find().sort('sortOrder -createdAt');
  res.json({ success: true, items });
});

export const createGodProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  await assignUniqueSlug(body, GodProduct);
  const product = await GodProduct.create(body);
  res.status(201).json({ success: true, product });
});

export const updateGodProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await GodProduct.findById(req.params.id).select('slug title');
  if (!existing) throw new ApiError(404, 'Product not found');
  await assignUniqueSlugForUpdate(body, GodProduct, existing, req.params.id);
  const product = await GodProduct.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const deleteGodProduct = asyncHandler(async (req, res) => {
  const product = await GodProduct.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

// ---------- Admin: orders ----------

export const adminListGodOrders = asyncHandler(async (req, res) => {
  const orders = await GodOrder.find().populate('godProduct').sort('-createdAt');
  res.json({ success: true, orders });
});

export const adminUpdateGodOrderStatus = asyncHandler(async (req, res) => {
  const order = await GodOrder.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, order });
});
