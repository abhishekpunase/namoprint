import { downloadTextFile } from './userAdminUtils'

export const COUPON_META_KEY = 'omgs_admin_coupon_meta'
export const COUPON_DRAFTS_KEY = 'omgs_admin_coupon_drafts'
export const COUPON_ACTIVITY_KEY = 'omgs_admin_coupon_activity'

export const DEFAULT_COLUMNS = [
  'code',
  'name',
  'type',
  'value',
  'usage',
  'maxUsage',
  'status',
  'startDate',
  'expiryDate',
  'appliesTo',
  'updated',
  'actions',
]

export const DISCOUNT_TYPES = [
  { value: 'percent', label: 'Percentage Discount' },
  { value: 'fixed', label: 'Fixed Amount', todo: true },
  { value: 'free_shipping', label: 'Free Shipping' },
  { value: 'bogo', label: 'Buy One Get One', todo: true },
  { value: 'buy_x_get_y', label: 'Buy X Get Y', todo: true },
  { value: 'bundle', label: 'Bundle Discount', todo: true },
]

export const COUPON_STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'expired', label: 'Expired' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function normalizeCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

export function getCouponMeta(code) {
  const all = readJson(COUPON_META_KEY, {})
  return all[normalizeCode(code)] || {}
}

export function setCouponMeta(code, patch) {
  const key = normalizeCode(code)
  const all = readJson(COUPON_META_KEY, {})
  all[key] = { ...(all[key] || {}), ...patch, updatedAt: new Date().toISOString() }
  writeJson(COUPON_META_KEY, all)
  return all[key]
}

export function getLocalDrafts() {
  return readJson(COUPON_DRAFTS_KEY, [])
}

export function saveLocalDraft(draft) {
  const drafts = getLocalDrafts()
  const code = normalizeCode(draft.code)
  const existing = drafts.findIndex((d) => normalizeCode(d.code) === code)
  const next = { ...draft, code, updatedAt: new Date().toISOString(), source: 'local' }
  if (existing >= 0) drafts[existing] = next
  else drafts.push(next)
  writeJson(COUPON_DRAFTS_KEY, drafts)
  appendCouponActivity({ code, action: 'Coupon saved (local draft)', detail: draft.name || code })
  return next
}

export function deleteLocalDraft(code) {
  const drafts = getLocalDrafts().filter((d) => normalizeCode(d.code) !== normalizeCode(code))
  writeJson(COUPON_DRAFTS_KEY, drafts)
}

export function appendCouponActivity(entry) {
  const logs = readJson(COUPON_ACTIVITY_KEY, [])
  logs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  })
  writeJson(COUPON_ACTIVITY_KEY, logs.slice(0, 500))
}

export function getCouponActivity(code) {
  const logs = readJson(COUPON_ACTIVITY_KEY, [])
  if (!code) return logs
  return logs.filter((l) => normalizeCode(l.code) === normalizeCode(code))
}

export function computeCouponStatus(coupon, meta = {}) {
  if (meta.status) return meta.status
  if (coupon.source === 'local') return coupon.status || 'draft'
  const now = Date.now()
  if (meta.disabled) return 'disabled'
  if (meta.startDate && new Date(meta.startDate).getTime() > now) return 'scheduled'
  if (meta.expiryDate && new Date(meta.expiryDate).getTime() < now) return 'expired'
  return 'active'
}

export function formatDiscountType(type) {
  if (type === 'percent') return 'Percentage'
  if (type === 'free_shipping') return 'Free Shipping'
  if (type === 'fixed') return 'Fixed Amount'
  return type || '—'
}

export function formatDiscountValue(coupon) {
  if (coupon.type === 'percent') return `${coupon.value || 0}%`
  if (coupon.type === 'free_shipping') return 'Free delivery'
  if (coupon.type === 'fixed') return `₹${coupon.value || 0}`
  return '—'
}

export function getAppliesToLabel(coupon, meta = {}) {
  if (meta.appliesTo) return meta.appliesTo
  if (coupon.firstOrderOnly) return 'First order only'
  if (coupon.minQuantity) return `Min ${coupon.minQuantity} items`
  if (coupon.minSubtotal) return `Min cart ₹${coupon.minSubtotal}`
  return 'All products'
}

export function enrichCoupon(coupon, orders = []) {
  const code = normalizeCode(coupon.code)
  const meta = getCouponMeta(code)
  const usageOrders = orders.filter((o) => normalizeCode(o.couponCode) === code)
  const totalDiscount = usageOrders.reduce((s, o) => s + (o.totals?.discount || 0), 0)
  const revenue = usageOrders.reduce((s, o) => s + (o.totals?.total || 0), 0)
  const status = computeCouponStatus(coupon, meta)
  const today = new Date().toDateString()
  const usedToday = usageOrders.filter((o) => new Date(o.createdAt).toDateString() === today).length

  return {
    ...coupon,
    ...meta,
    code,
    name: meta.name || coupon.label || coupon.code,
    description: meta.description || coupon.description || '',
    discountType: coupon.type,
    discountTypeLabel: formatDiscountType(coupon.type),
    discountValueLabel: formatDiscountValue(coupon),
    usageCount: usageOrders.length,
    usedToday,
    totalDiscount,
    revenue,
    averageOrderValue: usageOrders.length ? revenue / usageOrders.length : 0,
    maxUsage: meta.maxUsage ?? null,
    status,
    appliesTo: getAppliesToLabel(coupon, meta),
    startDate: meta.startDate || null,
    expiryDate: meta.expiryDate || null,
    createdBy: meta.createdBy || 'System',
    lastUpdated: meta.updatedAt || null,
    source: coupon.source || 'backend',
    isBackend: coupon.source !== 'local',
    usageOrders,
  }
}

export function mergeCoupons(apiCoupons = [], localDrafts = [], orders = []) {
  const map = new Map()
  apiCoupons.forEach((c) => {
    const code = normalizeCode(c.code)
    map.set(code, enrichCoupon({ ...c, source: 'backend' }, orders))
  })
  localDrafts.forEach((c) => {
    const code = normalizeCode(c.code)
    if (!map.has(code)) map.set(code, enrichCoupon({ ...c, source: 'local' }, orders))
  })
  return [...map.values()]
}

export function computeCouponDashboard(coupons = [], orders = []) {
  const today = new Date().toDateString()
  const usedToday = orders.filter(
    (o) => o.couponCode && new Date(o.createdAt).toDateString() === today,
  ).length
  const totalDiscount = orders.reduce((s, o) => s + (o.couponCode ? o.totals?.discount || 0 : 0), 0)
  const couponOrders = orders.filter((o) => o.couponCode)
  const revenue = couponOrders.reduce((s, o) => s + (o.totals?.total || 0), 0)

  return {
    total: coupons.length,
    active: coupons.filter((c) => c.status === 'active').length,
    expired: coupons.filter((c) => c.status === 'expired').length,
    scheduled: coupons.filter((c) => c.status === 'scheduled').length,
    disabled: coupons.filter((c) => c.status === 'disabled').length,
    draft: coupons.filter((c) => c.status === 'draft').length,
    usedToday,
    totalDiscount,
    averageDiscount: couponOrders.length ? totalDiscount / couponOrders.length : 0,
    revenue,
    conversionRate: orders.length ? ((couponOrders.length / orders.length) * 100).toFixed(1) : '0',
  }
}

export function matchesCouponSearch(coupon, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [coupon.code, coupon.name, coupon.label, coupon.discountTypeLabel, coupon.appliesTo]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q))
}

export function matchesCouponFilters(coupon, filters) {
  if (filters.status && coupon.status !== filters.status) return false
  if (filters.type && coupon.discountType !== filters.type) return false
  if (filters.automatic === 'yes' && !coupon.autoApply) return false
  if (filters.automatic === 'no' && coupon.autoApply) return false
  if (filters.source === 'backend' && coupon.source !== 'backend') return false
  if (filters.source === 'local' && coupon.source !== 'local') return false
  return true
}

export function exportCouponsCsv(coupons) {
  const header = ['Code', 'Name', 'Type', 'Value', 'Usage', 'Status', 'Applies To', 'Discount Given']
  const rows = coupons.map((c) =>
    [c.code, c.name, c.discountTypeLabel, c.discountValueLabel, c.usageCount, c.status, c.appliesTo, c.totalDiscount]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...rows].join('\n')
}

export function downloadCouponExport(coupons, format = 'csv') {
  downloadTextFile(`coupons-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'csv' : 'csv'}`, exportCouponsCsv(coupons))
}

export function printCouponsTable(coupons) {
  const html = `<html><head><title>Coupons</title><style>
    body{font-family:Arial,sans-serif;padding:24px} table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:8px;font-size:12px;text-align:left} th{background:#f5f5f5}
  </style></head><body><h1>Coupon Export</h1><table><thead><tr>
    <th>Code</th><th>Name</th><th>Type</th><th>Usage</th><th>Status</th>
  </tr></thead><tbody>${coupons
    .map(
      (c) =>
        `<tr><td>${c.code}</td><td>${c.name}</td><td>${c.discountTypeLabel}</td><td>${c.usageCount}</td><td>${c.status}</td></tr>`,
    )
    .join('')}</tbody></table></body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.print()
}

export const emptyCouponForm = () => ({
  name: '',
  code: '',
  description: '',
  notes: '',
  type: 'percent',
  value: 10,
  maxDiscount: '',
  minCart: '',
  maxCart: '',
  maxUsage: '',
  maxPerCustomer: 1,
  guestAllowed: true,
  startDate: '',
  startTime: '',
  expiryDate: '',
  expiryTime: '',
  timezone: 'Asia/Kolkata',
  appliesTo: 'all',
  productIds: [],
  categoryIds: [],
  firstOrderOnly: false,
  minQuantity: '',
  minSubtotal: '',
  excludeSale: false,
  autoApply: false,
  stackable: false,
  status: 'draft',
})

export function couponToForm(coupon) {
  return {
    ...emptyCouponForm(),
    name: coupon.name || coupon.label || '',
    code: coupon.code || '',
    description: coupon.description || '',
    notes: coupon.notes || '',
    type: coupon.type || coupon.discountType || 'percent',
    value: coupon.value ?? 10,
    minQuantity: coupon.minQuantity ?? '',
    minSubtotal: coupon.minSubtotal ?? '',
    firstOrderOnly: Boolean(coupon.firstOrderOnly),
    maxUsage: coupon.maxUsage ?? '',
    startDate: coupon.startDate ? coupon.startDate.slice(0, 10) : '',
    expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : '',
    appliesTo: coupon.appliesToKey || 'all',
    status: coupon.status || 'draft',
    autoApply: Boolean(coupon.autoApply),
  }
}

export function formToLocalCoupon(form) {
  return {
    code: normalizeCode(form.code),
    label: form.name,
    name: form.name,
    description: form.description,
    notes: form.notes,
    type: form.type,
    value: form.type === 'percent' ? Number(form.value) : undefined,
    minQuantity: form.minQuantity ? Number(form.minQuantity) : undefined,
    minSubtotal: form.minCart ? Number(form.minCart) : form.minSubtotal ? Number(form.minSubtotal) : undefined,
    firstOrderOnly: form.firstOrderOnly,
    status: form.status,
    maxUsage: form.maxUsage ? Number(form.maxUsage) : null,
    startDate: form.startDate || null,
    expiryDate: form.expiryDate || null,
    autoApply: form.autoApply,
    appliesToKey: form.appliesTo,
  }
}
