import {
  FREE_SHIPPING_MIN,
  SHIPPING_FEE,
  calculateLocalCouponDiscount,
} from '../data/coupons'
import {
  SPECIAL_DATE_DISCOUNT_PERCENT,
  isWithinSpecialDateWindow,
} from './specialDateDiscount'

export function calculateCheckoutTotals(subtotal, { specialDate, couponCode, totalQuantity = 0 } = {}) {
  const normalized = couponCode?.trim()
  const couponResult = normalized
    ? calculateLocalCouponDiscount(subtotal, totalQuantity, normalized)
    : { discount: 0, freeShipping: false, label: null }

  // Invalid stored coupon must not affect totals or block checkout
  const effectiveCoupon = couponResult.error
    ? { discount: 0, freeShipping: false, label: null }
    : couponResult

  let specialDateDiscount = 0
  let specialDateReason = null
  if (specialDate && subtotal > 0) {
    if (isWithinSpecialDateWindow(specialDate)) {
      specialDateDiscount = Math.round((subtotal * SPECIAL_DATE_DISCOUNT_PERCENT) / 100)
      specialDateReason = `${SPECIAL_DATE_DISCOUNT_PERCENT}% special date discount`
    } else {
      specialDateReason =
        'Special date saved — discount applies when you order within 7 days of that date each year.'
    }
  }

  const discount = Math.min(subtotal, effectiveCoupon.discount + specialDateDiscount)
  const afterDiscount = subtotal - discount
  const freeShipping =
    effectiveCoupon.freeShipping || afterDiscount >= FREE_SHIPPING_MIN || subtotal >= FREE_SHIPPING_MIN
  const shipping = subtotal === 0 || freeShipping ? 0 : SHIPPING_FEE
  const total = Math.max(0, afterDiscount + shipping)

  const discountLines = [effectiveCoupon.label, specialDateDiscount > 0 ? specialDateReason : null].filter(Boolean)

  return {
    subtotal,
    discount,
    couponDiscount: effectiveCoupon.discount,
    specialDateDiscount,
    shipping,
    total,
    freeShipping,
    discountApplied: discount > 0 || effectiveCoupon.freeShipping,
    discountReason: discountLines.join(' + ') || specialDateReason,
    couponError: couponResult.error || null,
    couponLabel: effectiveCoupon.label,
  }
}
