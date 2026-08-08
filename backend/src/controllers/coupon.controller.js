import { COUPON_LIST } from '../constants/coupons.js';
import { calculateOrderTotals, validateCouponForUser } from '../services/coupon.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Cart } from '../models/Cart.js';
import { User } from '../models/User.js';

const cartSubtotal = (items) => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

export const validateCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const items =
    cart?.items?.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })) || [];

  const subtotal = cartSubtotal(items);
  const { coupon, normalizedCode } = await validateCouponForUser({
    code: req.body.code,
    userId: req.user._id,
    items,
    subtotal,
  });

  const user = await User.findById(req.user._id).select('specialDate');
  const totals = calculateOrderTotals(items, {
    specialDate: user?.specialDate,
    coupon,
  });

  res.json({
    success: true,
    coupon: {
      code: normalizedCode,
      label: coupon.label,
      type: coupon.type,
      value: coupon.value,
    },
    totals,
  });
});

export const listCoupons = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    coupons: COUPON_LIST.map((coupon) => ({
      code: coupon.code,
      label: coupon.label,
      type: coupon.type,
      value: coupon.value,
      minQuantity: coupon.minQuantity,
      minSubtotal: coupon.minSubtotal,
      firstOrderOnly: coupon.firstOrderOnly,
    })),
  });
});
