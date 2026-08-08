export const FREE_SHIPPING_MIN = 999
export const SHIPPING_FEE = 99

export const COUPONS = {
  WELCOME10: {
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    label: 'Welcome Offer — 10% OFF',
    description: 'First order discount on premium prints.',
    firstOrderOnly: true,
  },
  BULK15: {
    code: 'BULK15',
    type: 'percent',
    value: 15,
    label: 'Bulk Savings — 15% OFF',
    description: 'Extra savings on bulk orders.',
    minQuantity: 5,
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'free_shipping',
    label: 'Free Delivery',
    description: 'Complimentary delivery on orders above ₹999.',
    minSubtotal: FREE_SHIPPING_MIN,
  },
}

export const COUPON_LIST = Object.values(COUPONS)

export function normalizeCouponCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

export function getCouponDefinition(code) {
  return COUPONS[normalizeCouponCode(code)] || null
}
