import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    paidOrders,
    revenueAgg,
    monthlyRevenueAgg,
    recentOrders,
    lowStockProducts
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ['Pending Payment', 'Paid', 'Processing'] } }),
    Order.countDocuments({ 'payment.status': 'Paid' }),
    Order.aggregate([
      { $match: { 'payment.status': 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]),
    Order.aggregate([
      { $match: { 'payment.status': 'Paid', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]),
    Order.find().sort('-createdAt').limit(10).select('orderNo customer totals status payment createdAt'),
    Product.find({ 'variants.stock': { $lte: 5 } })
      .select('title slug productType variants.sku variants.stock variants.size')
      .limit(20)
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      paidOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      monthlyRevenue: monthlyRevenueAgg[0]?.total || 0
    },
    recentOrders,
    lowStockProducts
  });
});

export const listAdminUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const q = req.query.q;
  const filter = q
    ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort('-createdAt').skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter)
  ]);

  res.json({ success: true, users, pagination: { page, limit, total } });
});

export const getAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  const orders = await Order.find({ user: user._id }).sort('-createdAt').limit(50);
  res.json({ success: true, user, orders });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true, runValidators: true }
  ).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, user });
});

export const listAdminProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const q = req.query.q;
  const filter = q ? { $text: { $search: q } } : {};
  if (req.query.productType) filter.productType = req.query.productType;

  const [items, total] = await Promise.all([
    Product.find(filter).populate('category subCategory').sort('-createdAt').skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)
  ]);

  res.json({ success: true, items, pagination: { page, limit, total } });
});

export const listAdminCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().populate('parent').sort('sortOrder name');
  res.json({ success: true, categories });
});
