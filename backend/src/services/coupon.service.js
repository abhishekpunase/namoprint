import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { FREE_SHIPPING_MIN, SHIPPING_FEE, getCouponDefinition, normalizeCouponCode } from '../constants/coupons.js';
import { calculateSpecialDateDiscount } from './discount.service.js';
import { ApiError } from '../utils/apiError.js';

export async function validateCouponForUser({ code, userId, items, subtotal }) {
  const coupon = getCouponDefinition(code);
  if (!coupon) throw new ApiError(400, 'Invalid coupon code');

  const normalized = normalizeCouponCode(code);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (coupon.firstOrderOnly) {
    const paidOrders = await Order.countDocuments({ user: userId, 'payment.status': 'Paid' });
    if (paidOrders > 0) throw new ApiError(400, 'WELCOME10 is valid only on your first paid order');
  }

  if (coupon.minQuantity && totalQuantity < coupon.minQuantity) {
    throw new ApiError(400, `Add at least ${coupon.minQuantity} items to use ${normalized}`);
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    throw new ApiError(400, `Minimum order value ₹${coupon.minSubtotal} required for ${normalized}`);
  }

  const user = await User.findById(userId).select('usedCoupons');
  if (user?.usedCoupons?.includes(normalized)) {
    throw new ApiError(400, `Coupon ${normalized} has already been used`);
  }

  return { coupon, normalizedCode: normalized };
}

export function calculateCouponDiscount(subtotal, coupon) {
  if (!coupon || subtotal <= 0) return { amount: 0, label: null, freeShipping: false };

  if (coupon.type === 'percent') {
    return {
      amount: Math.round((subtotal * coupon.value) / 100),
      label: `${coupon.value}% off (${coupon.code})`,
      freeShipping: false,
    };
  }

  if (coupon.type === 'free_shipping') {
    return {
      amount: 0,
      label: 'Free delivery coupon applied',
      freeShipping: true,
    };
  }

  return { amount: 0, label: null, freeShipping: false };
}

export function calculateOrderTotals(items, { specialDate, coupon } = {}) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const couponResult = calculateCouponDiscount(subtotal, coupon);
  const specialResult = calculateSpecialDateDiscount(subtotal, specialDate);

  const couponDiscount = couponResult.amount;
  const specialDateDiscount = specialResult.discount;
  const discount = Math.min(subtotal, couponDiscount + specialDateDiscount);

  const afterDiscount = subtotal - discount;
  const qualifiesForFreeShipping =
    couponResult.freeShipping || afterDiscount >= FREE_SHIPPING_MIN || subtotal >= FREE_SHIPPING_MIN;
  const shipping = subtotal === 0 || qualifiesForFreeShipping ? 0 : SHIPPING_FEE;
  const tax = 0;
  const total = Math.max(0, afterDiscount + shipping + tax);

  const discountNotes = [couponResult.label, specialResult.applied ? specialResult.reason : null].filter(Boolean);

  return {
    subtotal,
    shipping,
    discount,
    couponDiscount,
    specialDateDiscount,
    tax,
    total,
    currency: 'INR',
    discountApplied: discount > 0 || couponResult.freeShipping,
    discountReason: discountNotes.join(' + ') || specialResult.reason,
    freeShippingApplied: qualifiesForFreeShipping,
  };
}

export async function markCouponUsed(userId, couponCode) {
  if (!couponCode) return;
  const normalized = normalizeCouponCode(couponCode);
  if (!getCouponDefinition(normalized)) return;
  await User.findByIdAndUpdate(userId, { $addToSet: { usedCoupons: normalized } });
}
