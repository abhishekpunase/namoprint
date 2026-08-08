import { NamePlateOrder } from '../models/NamePlateOrder.js';
import { NamePlateProduct } from '../models/NamePlateProduct.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assignUniqueSlug, assignUniqueSlugForUpdate } from '../utils/uniqueSlug.js';

// ---------- Public: catalog ----------

export const listNamePlateProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    NamePlateProduct.find(filter).sort('sortOrder -createdAt').skip(skip).limit(limit),
    NamePlateProduct.countDocuments(filter)
  ]);

  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const getNamePlateProduct = asyncHandler(async (req, res) => {
  const product = await NamePlateProduct.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new ApiError(404, 'Name plate not found');
  res.json({ success: true, product });
});

// ---------- Public: order (captures customer's heading + subtext) ----------

export const createNamePlateOrder = asyncHandler(async (req, res) => {
  const product = await NamePlateProduct.findById(req.body.namePlateProductId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

  const option = product.qualityOptions.id(req.body.qualityOptionId);
  if (!option || !option.isActive) throw new ApiError(404, 'Selected quality option not found');
  if (option.stock < req.body.quantity) throw new ApiError(409, 'Selected quantity is out of stock');

  const order = await NamePlateOrder.create({
    namePlateProduct: product._id,
    productTitle: product.title,
    qualityLabel: option.label,
    unitPrice: option.price,
    quantity: req.body.quantity,
    totalPrice: option.price * req.body.quantity,
    headingText: req.body.headingText,
    subText: req.body.subText,
    customerName: req.body.customerName,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
    notes: req.body.notes
  });

  res.status(201).json({ success: true, order });
});

// ---------- Admin: catalog CRUD ----------

export const adminListNamePlateProducts = asyncHandler(async (req, res) => {
  const items = await NamePlateProduct.find().sort('sortOrder -createdAt');
  res.json({ success: true, items });
});

export const createNamePlateProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  await assignUniqueSlug(body, NamePlateProduct);
  const product = await NamePlateProduct.create(body);
  res.status(201).json({ success: true, product });
});

export const updateNamePlateProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const existing = await NamePlateProduct.findById(req.params.id).select('slug title');
  if (!existing) throw new ApiError(404, 'Product not found');
  await assignUniqueSlugForUpdate(body, NamePlateProduct, existing, req.params.id);
  const product = await NamePlateProduct.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const deleteNamePlateProduct = asyncHandler(async (req, res) => {
  const product = await NamePlateProduct.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

// ---------- Admin: orders (see what every customer wants on their plate) ----------

export const adminListNamePlateOrders = asyncHandler(async (req, res) => {
  const orders = await NamePlateOrder.find().populate('namePlateProduct').sort('-createdAt');
  res.json({ success: true, orders });
});

export const adminUpdateNamePlateOrderStatus = asyncHandler(async (req, res) => {
  const order = await NamePlateOrder.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, order });
});
