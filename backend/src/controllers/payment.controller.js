import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { createRazorpayOrder, getPublicRazorpayKeyId, verifyRazorpaySignature } from '../services/payment.service.js';
import { markCouponUsed } from '../services/coupon.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (req.user.role !== 'admin' && order.user?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You cannot pay for this order');
  }
  if (order.payment.status === 'Paid') throw new ApiError(409, 'Order is already paid');

  const razorpayOrder = await createRazorpayOrder({
    amount: order.totals.total,
    receipt: order.orderNo
  });

  order.payment.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json({
    success: true,
    razorpay: {
      keyId: await getPublicRazorpayKeyId(),
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    }
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (req.user.role !== 'admin' && order.user?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You cannot verify this order');
  }

  const valid = await verifyRazorpaySignature({
    razorpayOrderId: req.body.razorpayOrderId,
    razorpayPaymentId: req.body.razorpayPaymentId,
    razorpaySignature: req.body.razorpaySignature
  });

  if (!valid) throw new ApiError(400, 'Invalid Razorpay signature');

  order.payment.status = 'Paid';
  order.payment.razorpayOrderId = req.body.razorpayOrderId;
  order.payment.razorpayPaymentId = req.body.razorpayPaymentId;
  order.payment.razorpaySignature = req.body.razorpaySignature;
  order.payment.paidAt = new Date();
  order.status = 'Paid';
  order.statusHistory.push({ status: 'Paid', note: 'Payment verified by Razorpay signature' });

  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, 'variants.sku': item.sku },
      { $inc: { 'variants.$.stock': -item.quantity } }
    );
  }

  await order.save();
  await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });
  await markCouponUsed(order.user, order.couponCode);
  res.json({ success: true, order });
});
