export const FREE_SHIPPING_MIN = 999
export const SHIPPING_FEE = 99
export const COUPON_STORAGE_KEY = 'omgs_applied_coupon'

export const HOME_OFFERS = [
  {
    id: 1,
    title: '10% OFF',
    subtitle: 'Welcome Offer',
    description: 'Create your first order today and enjoy an instant discount on premium furniture.',
    code: 'WELCOME10',
    icon: 'percent',
    gradient: 'from-orange-500 via-orange-400 to-yellow-400',
  },
  {
    id: 2,
    title: 'Bulk Savings',
    subtitle: 'Extra 15% OFF',
    description: 'Planning a hotel, office or cafe setup? Get exclusive pricing on bulk orders.',
    code: 'BULK15',
    icon: 'gift',
    gradient: 'from-slate-900 via-slate-800 to-gray-700',
  },
  {
    id: 3,
    title: 'Free Delivery',
    subtitle: 'Above ₹999',
    description: 'Shop more and save more with complimentary doorstep delivery across India.',
    code: 'FREESHIP',
    icon: 'truck',
    gradient: 'from-orange-400 via-red-400 to-orange-600',
  },
]

export const COUPONS = {
  WELCOME10: { code: 'WELCOME10', type: 'percent', value: 10, firstOrderOnly: true },
  BULK15: { code: 'BULK15', type: 'percent', value: 15, minQuantity: 5 },
  FREESHIP: { code: 'FREESHIP', type: 'free_shipping', minSubtotal: FREE_SHIPPING_MIN },
}

export function normalizeCouponCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

export function getStoredCoupon() {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY)
    if (!raw) return ''
    const parsed = JSON.parse(raw)
    return normalizeCouponCode(parsed?.code || '')
  } catch {
    return ''
  }
}

export function storeCoupon(code) {
  const normalized = normalizeCouponCode(code)
  if (!normalized) {
    localStorage.removeItem(COUPON_STORAGE_KEY)
    return ''
  }
  localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify({ code: normalized, savedAt: Date.now() }))
  return normalized
}

export function clearStoredCoupon() {
  localStorage.removeItem(COUPON_STORAGE_KEY)
}

export function getCouponDefinition(code) {
  return COUPONS[normalizeCouponCode(code)] || null
}

export function calculateLocalCouponDiscount(subtotal, totalQuantity, code) {
  const coupon = getCouponDefinition(code)
  if (!coupon || subtotal <= 0) return { discount: 0, freeShipping: false, label: null }

  if (coupon.minQuantity && totalQuantity < coupon.minQuantity) {
    return { discount: 0, freeShipping: false, label: null, error: `Need ${coupon.minQuantity}+ items for ${coupon.code}` }
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return {
      discount: 0,
      freeShipping: false,
      label: null,
      error: `Minimum ₹${coupon.minSubtotal} required for ${coupon.code}`,
    }
  }

  if (coupon.type === 'percent') {
    return {
      discount: Math.round((subtotal * coupon.value) / 100),
      freeShipping: false,
      label: `${coupon.value}% off (${coupon.code})`,
    }
  }

  if (coupon.type === 'free_shipping') {
    return { discount: 0, freeShipping: true, label: 'Free delivery coupon' }
  }

  return { discount: 0, freeShipping: false, label: null }
}
