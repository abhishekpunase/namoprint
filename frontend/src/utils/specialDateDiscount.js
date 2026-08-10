export const SPECIAL_DATE_WINDOW_DAYS = 7
export const SPECIAL_DATE_DISCOUNT_PERCENT = 10

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

export function formatDateInputValue(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
