/** Days before/after special date when discount applies */
export const SPECIAL_DATE_WINDOW_DAYS = 7

/** Discount percent when ordering during special date window */
export const SPECIAL_DATE_DISCOUNT_PERCENT = 10

/**
 * Check if today falls within the anniversary window for a recurring date (month/day).
 */
export function isWithinSpecialDateWindow(specialDate, now = new Date(), windowDays = SPECIAL_DATE_WINDOW_DAYS) {
  if (!specialDate) return false

  const anchor = new Date(specialDate)
  if (Number.isNaN(anchor.getTime())) return false

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const year = now.getFullYear()
  const candidates = [
    new Date(year, anchor.getMonth(), anchor.getDate()),
    new Date(year - 1, anchor.getMonth(), anchor.getDate()),
    new Date(year + 1, anchor.getMonth(), anchor.getDate()),
  ]

  const msPerDay = 1000 * 60 * 60 * 24
  return candidates.some((candidate) => {
    const diffDays = Math.abs(Math.round((today - candidate) / msPerDay))
    return diffDays <= windowDays
  })
}

export function calculateSpecialDateDiscount(subtotal, specialDate, now = new Date()) {
  if (!specialDate || subtotal <= 0) return { discount: 0, applied: false, reason: null }

  if (!isWithinSpecialDateWindow(specialDate, now)) {
    return {
      discount: 0,
      applied: false,
      reason: 'Special date saved — discount applies when you order near that date each year.',
    }
  }

  const discount = Math.round((subtotal * SPECIAL_DATE_DISCOUNT_PERCENT) / 100)
  return {
    discount,
    applied: true,
    reason: `${SPECIAL_DATE_DISCOUNT_PERCENT}% special date discount applied`,
  }
}
