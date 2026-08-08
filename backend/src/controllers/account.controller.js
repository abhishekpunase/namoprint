import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  addresses: user.addresses,
  specialDate: user.specialDate,
  specialDateLabel: user.specialDateLabel,
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true
  });
  res.json({ success: true, user: publicUser(user) });
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((address) => (address.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new ApiError(404, 'Address not found');
  user.addresses.pull(req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

export const getMyPurchaseHistory = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'title slug images productType')
    .sort('-createdAt');

  const summary = {
    totalOrders: orders.length,
    paidOrders: orders.filter((order) => order.payment.status === 'Paid').length,
    totalSpent: orders
      .filter((order) => order.payment.status === 'Paid')
      .reduce((sum, order) => sum + order.totals.total, 0)
  };

  res.json({ success: true, summary, orders });
});

export const getMyPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Order.find({ user: req.user._id })
    .select('orderNo totals payment status createdAt items.title items.quantity')
    .sort('-createdAt');

  res.json({ success: true, payments });
});
