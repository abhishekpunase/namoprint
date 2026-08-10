import { downloadTextFile } from './userAdminUtils'

export const CUSTOMER_META_KEY = 'omgs_customer_meta'
export const CUSTOMER_NOTES_KEY = 'omgs_customer_notes'

export const DEFAULT_CUSTOMER_COLUMNS = [
  'avatar',
  'name',
  'id',
  'email',
  'phone',
  'country',
  'city',
  'orders',
  'ltv',
  'wishlist',
  'status',
  'registered',
  'lastLogin',
  'actions',
]

export const CUSTOMER_SEGMENTS = [
  { value: '', label: 'All customers' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'vip', label: 'VIP' },
  { value: 'new', label: 'New customers' },
  { value: 'returning', label: 'Returning' },
  { value: 'top', label: 'Top buyers' },
]

export function getCustomerId(customer) {
  return customer?._id || customer?.id
}

export function getCustomerInitials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  )
}

export function formatCustomerDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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

export function getCustomerMeta(customerId) {
  const all = readJson(CUSTOMER_META_KEY, {})
  return all[customerId] || { vip: false, lastLogin: null, tags: [], wishlistCount: 0 }
}

export function setCustomerMeta(customerId, patch) {
  const all = readJson(CUSTOMER_META_KEY, {})
  all[customerId] = { ...(all[customerId] || {}), ...patch }
  writeJson(CUSTOMER_META_KEY, all)
  return all[customerId]
}

export function getCustomerNotes(customerId) {
  const all = readJson(CUSTOMER_NOTES_KEY, {})
  return all[customerId] || []
}

export function addCustomerNote(customerId, text, pinned = false) {
  const all = readJson(CUSTOMER_NOTES_KEY, {})
  const notes = all[customerId] || []
  const note = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    pinned,
    createdAt: new Date().toISOString(),
    author: 'Admin',
  }
  all[customerId] = [note, ...notes]
  writeJson(CUSTOMER_NOTES_KEY, all)
  return note
}

export function deleteCustomerNote(customerId, noteId) {
  const all = readJson(CUSTOMER_NOTES_KEY, {})
  all[customerId] = (all[customerId] || []).filter((n) => n.id !== noteId)
  writeJson(CUSTOMER_NOTES_KEY, all)
}

export function getDefaultAddress(customer) {
  const addresses = customer?.addresses || []
  return addresses.find((a) => a.isDefault) || addresses[0] || null
}

export function getCustomerLocation(customer) {
  const addr = getDefaultAddress(customer)
  return {
    city: addr?.city || '—',
    state: addr?.state || '—',
    country: addr?.country || '—',
  }
}

export function getOrdersForCustomer(orders, customerId) {
  const id = String(customerId)
  return orders.filter((o) => String(o.user?._id || o.user) === id)
}

export function computeCustomerStats(orders = []) {
  const paid = orders.filter((o) => o.payment?.status === 'Paid')
  const ltv = paid.reduce((sum, o) => sum + (o.totals?.total || 0), 0)
  const productsPurchased = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((s, i) => s + (i.quantity || 0), 0),
    0,
  )
  const lastPurchase = orders.reduce((latest, o) => {
    const t = new Date(o.createdAt).getTime()
    return t > latest ? t : latest
  }, 0)

  return {
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => o.status === 'Delivered').length,
    cancelledOrders: orders.filter((o) => o.status === 'Cancelled').length,
    refunds: orders.filter((o) => o.status === 'Refunded' || o.payment?.status === 'Refunded').length,
    averageOrderValue: paid.length ? ltv / paid.length : 0,
    lifetimeValue: ltv,
    productsPurchased,
    lastPurchase: lastPurchase ? new Date(lastPurchase).toISOString() : null,
    paidOrders: paid.length,
  }
}

export function enrichCustomer(customer, orders = []) {
  const id = getCustomerId(customer)
  const customerOrders = getOrdersForCustomer(orders, id)
  const stats = computeCustomerStats(customerOrders)
  const meta = getCustomerMeta(id)
  const location = getCustomerLocation(customer)
  const isNew = stats.totalOrders <= 1
  const isReturning = stats.totalOrders > 1
  const isTopBuyer = stats.lifetimeValue >= 5000

  return {
    ...customer,
    customerId: id,
    stats,
    meta,
    location,
    segments: {
      isNew,
      isReturning,
      isTopBuyer,
      isVip: meta.vip,
      isBlocked: customer.isActive === false,
      isActive: customer.isActive !== false,
    },
  }
}

export function matchesCustomerSearch(customer, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const id = getCustomerId(customer)
  const loc = getCustomerLocation(customer)
  return [customer.name, customer.email, customer.phone, id, loc.city, loc.country, loc.state]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q))
}

export function matchesCustomerFilters(customer, filters) {
  const enriched = customer.stats ? customer : enrichCustomer(customer, customer._orders || [])
  const { segments, stats, location, meta } = enriched

  if (filters.segment === 'active' && !segments.isActive) return false
  if (filters.segment === 'inactive' && segments.isActive) return false
  if (filters.segment === 'blocked' && !segments.isBlocked) return false
  if (filters.segment === 'vip' && !segments.isVip) return false
  if (filters.segment === 'new' && !segments.isNew) return false
  if (filters.segment === 'returning' && !segments.isReturning) return false
  if (filters.segment === 'top' && !segments.isTopBuyer) return false

  if (filters.country && location.country !== filters.country) return false
  if (filters.state && location.state !== filters.state) return false
  if (filters.city && location.city !== filters.city) return false

  if (filters.ordersMin && stats.totalOrders < Number(filters.ordersMin)) return false
  if (filters.ordersMax && stats.totalOrders > Number(filters.ordersMax)) return false
  if (filters.ltvMin && stats.lifetimeValue < Number(filters.ltvMin)) return false
  if (filters.ltvMax && stats.lifetimeValue > Number(filters.ltvMax)) return false

  if (filters.dateFrom) {
    const created = new Date(customer.createdAt).getTime()
    if (created < new Date(filters.dateFrom).getTime()) return false
  }
  if (filters.dateTo) {
    const created = new Date(customer.createdAt).getTime()
    if (created > new Date(filters.dateTo).getTime() + 86400000) return false
  }

  if (filters.status === 'active' && customer.isActive === false) return false
  if (filters.status === 'disabled' && customer.isActive !== false) return false

  return true
}

export function buildCustomerActivity(customer, orders = []) {
  const events = []
  if (customer.createdAt) {
    events.push({
      id: 'created',
      type: 'account',
      title: 'Account created',
      description: `${customer.name} registered`,
      timestamp: customer.createdAt,
    })
  }

  const meta = getCustomerMeta(getCustomerId(customer))
  if (meta.lastLogin) {
    events.push({
      id: 'login',
      type: 'login',
      title: 'Last login',
      description: 'Customer signed in',
      timestamp: meta.lastLogin,
    })
  }

  orders.forEach((order) => {
    events.push({
      id: `order-${order._id || order.id}`,
      type: 'order',
      title: `Order ${order.orderNo}`,
      description: `${order.status} · ₹${order.totals?.total || 0}`,
      timestamp: order.createdAt,
    })
  })

  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  return events
}

export function exportCustomersCsv(customers) {
  const header = [
    'Customer ID',
    'Name',
    'Email',
    'Phone',
    'City',
    'Country',
    'Orders',
    'Lifetime Value',
    'Status',
    'Registered',
  ]
  const rows = customers.map((c) => {
    const stats = c.stats || computeCustomerStats([])
    const loc = c.location || getCustomerLocation(c)
    return [
      getCustomerId(c),
      c.name,
      c.email,
      c.phone || '',
      loc.city,
      loc.country,
      stats.totalOrders,
      stats.lifetimeValue,
      c.isActive !== false ? 'Active' : 'Blocked',
      c.createdAt ? new Date(c.createdAt).toISOString() : '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  })
  return [header.join(','), ...rows].join('\n')
}

export function exportCustomersExcel(customers) {
  downloadTextFile(`customers-${new Date().toISOString().slice(0, 10)}.csv`, exportCustomersCsv(customers))
}

export function printCustomersTable(customers) {
  const html = `<html><head><title>Customers</title><style>
    body{font-family:Arial,sans-serif;padding:24px} table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px} th{background:#f5f5f5}
  </style></head><body><h1>Customer Export</h1><table><thead><tr>
    <th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>LTV</th><th>Status</th>
  </tr></thead><tbody>${customers
    .map((c) => {
      const stats = c.stats || {}
      return `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.phone || '—'}</td><td>${stats.totalOrders || 0}</td><td>₹${stats.lifetimeValue || 0}</td><td>${c.isActive !== false ? 'Active' : 'Blocked'}</td></tr>`
    })
    .join('')}</tbody></table></body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}

export function getUniqueLocations(customers) {
  const countries = new Set()
  const states = new Set()
  const cities = new Set()
  customers.forEach((c) => {
    const loc = c.location || getCustomerLocation(c)
    if (loc.country && loc.country !== '—') countries.add(loc.country)
    if (loc.state && loc.state !== '—') states.add(loc.state)
    if (loc.city && loc.city !== '—') cities.add(loc.city)
  })
  return {
    countries: [...countries].sort(),
    states: [...states].sort(),
    cities: [...cities].sort(),
  }
}
