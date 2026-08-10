import { downloadTextFile } from './userAdminUtils'

export const NOTIF_READ_KEY = 'omgs_notification_read_ids'
export const NOTIF_PINNED_KEY = 'omgs_notification_pinned_ids'
export const NOTIF_ACTIVITY_KEY = 'omgs_notification_activity'
export const NOTIF_EMAIL_DRAFTS_KEY = 'omgs_notification_email_drafts'
export const NOTIF_EMAIL_SENT_KEY = 'omgs_notification_email_sent'
export const NOTIF_SMS_KEY = 'omgs_notification_sms'
export const NOTIF_PUSH_KEY = 'omgs_notification_push'
export const NOTIF_ANNOUNCEMENTS_KEY = 'omgs_notification_announcements'
export const NOTIF_AUTOMATION_KEY = 'omgs_notification_automation'

export const NOTIFICATION_TABS = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'important', label: 'Important' },
  { value: 'system', label: 'System' },
  { value: 'orders', label: 'Orders' },
  { value: 'products', label: 'Products' },
  { value: 'customers', label: 'Customers' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'payments', label: 'Payments' },
  { value: 'marketing', label: 'Marketing' },
]

export const NOTIFICATION_TYPES = [
  { value: '', label: 'All types' },
  { value: 'system', label: 'System' },
  { value: 'orders', label: 'Orders' },
  { value: 'payments', label: 'Payments' },
  { value: 'customers', label: 'Customers' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'products', label: 'Products' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'coupons', label: 'Coupons' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'security', label: 'Security' },
]

export const PRIORITY_LEVELS = [
  { value: '', label: 'All priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'info', label: 'Info' },
]

export const EMAIL_TEMPLATES = [
  { id: 'order_confirmation', label: 'Order Confirmation', subject: 'Your order {{orderNo}} is confirmed' },
  { id: 'order_shipped', label: 'Order Shipped', subject: 'Your order {{orderNo}} has shipped' },
  { id: 'order_delivered', label: 'Order Delivered', subject: 'Your order {{orderNo}} was delivered' },
  { id: 'refund', label: 'Refund', subject: 'Refund processed for order {{orderNo}}' },
  { id: 'welcome', label: 'Welcome Email', subject: 'Welcome to NamoPrint' },
  { id: 'password_reset', label: 'Password Reset', subject: 'Reset your password' },
  { id: 'low_stock', label: 'Low Stock Alert', subject: 'Low stock alert: {{product}}' },
  { id: 'custom', label: 'Custom Template', subject: '' },
]

export const SMS_TEMPLATES = [
  { id: 'order_update', label: 'Order Update', body: 'Your order {{orderNo}} status: {{status}}' },
  { id: 'delivery', label: 'Out for Delivery', body: 'Your package is on the way!' },
  { id: 'otp', label: 'OTP', body: 'Your verification code is {{code}}' },
]

export const WHATSAPP_NUMBER = '+919098570277'

export const DEFAULT_COLUMNS = [
  'icon',
  'title',
  'type',
  'priority',
  'recipient',
  'status',
  'created',
  'actions',
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

export function getReadIds() {
  return new Set(readJson(NOTIF_READ_KEY, []))
}

export function markAsRead(id) {
  const ids = readJson(NOTIF_READ_KEY, [])
  if (!ids.includes(id)) ids.push(id)
  writeJson(NOTIF_READ_KEY, ids)
  appendActivity({ action: 'Notification read', detail: id })
}

export function markAllAsRead(allIds) {
  writeJson(NOTIF_READ_KEY, allIds)
  appendActivity({ action: 'All notifications marked read', detail: `${allIds.length} items` })
}

export function getPinnedIds() {
  return new Set(readJson(NOTIF_PINNED_KEY, []))
}

export function togglePin(id) {
  const ids = readJson(NOTIF_PINNED_KEY, [])
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
  writeJson(NOTIF_PINNED_KEY, next)
  return next.includes(id)
}

export function appendActivity(entry) {
  const logs = readJson(NOTIF_ACTIVITY_KEY, [])
  logs.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  })
  writeJson(NOTIF_ACTIVITY_KEY, logs.slice(0, 500))
}

export function getActivity() {
  return readJson(NOTIF_ACTIVITY_KEY, [])
}

function inferPriority(type, meta = {}) {
  if (meta.priority) return meta.priority
  if (type === 'payments' && meta.failed) return 'critical'
  if (type === 'orders' && meta.paid) return 'high'
  if (type === 'inventory') return 'high'
  if (type === 'security') return 'critical'
  if (type === 'shipping') return 'medium'
  return 'info'
}

export function buildNotificationsFromData({ orders = [], users = [], lowStock = [], dashboard = null } = {}) {
  const items = []
  const today = new Date().toDateString()

  orders.slice(0, 50).forEach((order) => {
    const id = `order-${order._id}`
    items.push({
      id,
      title: `Order ${order.orderNo}`,
      description: `${order.customer?.name || 'Customer'} · ${order.status} · ₹${order.totals?.total || 0}`,
      type: 'orders',
      priority: inferPriority('orders', { paid: order.payment?.status === 'Paid' }),
      recipient: order.customer?.email || '—',
      status: order.payment?.status === 'Paid' ? 'delivered' : 'pending',
      createdAt: order.createdAt,
      important: order.payment?.status === 'Paid',
      link: `/admin/orders/${order._id}`,
    })

    if (order.payment?.status === 'Paid') {
      items.push({
        id: `pay-${order._id}`,
        title: 'Payment received',
        description: `${order.orderNo} · ₹${order.totals?.total || 0}`,
        type: 'payments',
        priority: 'high',
        recipient: order.customer?.email || '—',
        status: 'delivered',
        createdAt: order.payment?.paidAt || order.updatedAt || order.createdAt,
        link: `/admin/orders/${order._id}`,
      })
    }

    if (order.payment?.status === 'Failed') {
      items.push({
        id: `pay-fail-${order._id}`,
        title: 'Payment failed',
        description: order.orderNo,
        type: 'payments',
        priority: 'critical',
        recipient: order.customer?.email || '—',
        status: 'failed',
        createdAt: order.updatedAt || order.createdAt,
        link: `/admin/orders/${order._id}`,
      })
    }

    if (order.couponCode) {
      items.push({
        id: `coupon-${order._id}`,
        title: 'Coupon redeemed',
        description: `${order.couponCode} on ${order.orderNo}`,
        type: 'coupons',
        priority: 'low',
        recipient: order.customer?.email || '—',
        status: 'delivered',
        createdAt: order.createdAt,
        typeCategory: 'marketing',
      })
    }

    if (order.status === 'Shipped' || order.shipment?.shippedAt) {
      items.push({
        id: `ship-${order._id}`,
        title: 'Order shipped',
        description: `${order.orderNo} · ${order.shipment?.courierName || 'Courier'}`,
        type: 'shipping',
        priority: 'medium',
        recipient: order.customer?.email || '—',
        status: 'delivered',
        createdAt: order.shipment?.shippedAt || order.updatedAt,
        link: `/admin/orders/${order._id}`,
      })
    }
  })

  users.filter((u) => u.role === 'customer').slice(0, 20).forEach((user) => {
    items.push({
      id: `user-${user._id}`,
      title: 'New customer registered',
      description: user.email,
      type: 'customers',
      priority: 'info',
      recipient: user.email,
      status: 'delivered',
      createdAt: user.createdAt,
      link: `/admin/customers/${user._id}`,
    })
  })

  ;(lowStock || []).slice(0, 15).forEach((product) => {
    ;(product.variants || []).filter((v) => v.stock <= 5).forEach((variant) => {
      items.push({
        id: `stock-${product._id}-${variant._id || variant.sku}`,
        title: 'Low stock alert',
        description: `${product.title} · ${variant.sku} · ${variant.stock} left`,
        type: 'inventory',
        priority: variant.stock === 0 ? 'critical' : 'high',
        recipient: 'Admin',
        status: 'pending',
        createdAt: new Date().toISOString(),
        important: true,
        link: `/admin/inventory/product/${product._id}`,
      })
    })
  })

  items.push({
    id: 'system-dashboard',
    title: 'Dashboard synced',
    description: `${dashboard?.stats?.totalOrders || 0} orders · ₹${dashboard?.stats?.totalRevenue || 0} revenue`,
    type: 'system',
    priority: 'info',
    recipient: 'Admin',
    status: 'delivered',
    createdAt: new Date().toISOString(),
  })

  const readIds = getReadIds()
  const pinnedIds = getPinnedIds()

  return items
    .map((n) => ({
      ...n,
      unread: !readIds.has(n.id),
      pinned: pinnedIds.has(n.id),
      typeCategory: n.typeCategory || n.type,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function computeNotificationDashboard(notifications = [], sent = { emails: [], sms: [], push: [] }) {
  const today = new Date().toDateString()
  const todayNotifs = notifications.filter((n) => new Date(n.createdAt).toDateString() === today)
  const emailsSent = sent.emails?.length || 0
  const smsSent = sent.sms?.length || 0
  const pushSent = sent.push?.length || 0
  const failed = notifications.filter((n) => n.status === 'failed').length
  const delivered = notifications.filter((n) => n.status === 'delivered').length
  const total = notifications.length || 1

  return {
    unread: notifications.filter((n) => n.unread).length,
    today: todayNotifs.length,
    emailsSent,
    smsSent,
    pushSent,
    failed,
    deliveryRate: ((delivered / total) * 100).toFixed(1),
    openRate: '—',
    clickRate: '—',
  }
}

export function matchesNotificationTab(item, tab) {
  if (!tab) return true
  if (tab === 'unread') return item.unread
  if (tab === 'read') return !item.unread
  if (tab === 'important') return item.important || item.pinned || item.priority === 'critical' || item.priority === 'high'
  if (tab === 'marketing') return item.type === 'coupons' || item.type === 'marketing'
  return item.type === tab || item.typeCategory === tab
}

export function matchesNotificationSearch(item, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [item.title, item.description, item.recipient, item.type]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q))
}

export function matchesNotificationFilters(item, filters) {
  if (filters.type && item.type !== filters.type) return false
  if (filters.priority && item.priority !== filters.priority) return false
  if (filters.status && item.status !== filters.status) return false
  return true
}

export function getEmailDrafts() {
  return readJson(NOTIF_EMAIL_DRAFTS_KEY, [])
}

export function saveEmailDraft(draft) {
  const drafts = getEmailDrafts()
  const entry = { ...draft, id: draft.id || `draft-${Date.now()}`, updatedAt: new Date().toISOString() }
  const idx = drafts.findIndex((d) => d.id === entry.id)
  if (idx >= 0) drafts[idx] = entry
  else drafts.unshift(entry)
  writeJson(NOTIF_EMAIL_DRAFTS_KEY, drafts.slice(0, 50))
  return entry
}

export function getSentMessages() {
  return {
    emails: readJson(NOTIF_EMAIL_SENT_KEY, []),
    sms: readJson(NOTIF_SMS_KEY, []),
    push: readJson(NOTIF_PUSH_KEY, []),
  }
}

export function recordSentEmail(email) {
  const emails = readJson(NOTIF_EMAIL_SENT_KEY, [])
  emails.unshift({ ...email, id: `email-${Date.now()}`, sentAt: new Date().toISOString(), status: 'sent' })
  writeJson(NOTIF_EMAIL_SENT_KEY, emails.slice(0, 200))
  appendActivity({ action: 'Email sent (local)', detail: email.subject, channel: 'email' })
}

export function recordSentSms(sms) {
  const list = readJson(NOTIF_SMS_KEY, [])
  list.unshift({ ...sms, id: `sms-${Date.now()}`, sentAt: new Date().toISOString(), status: 'queued' })
  writeJson(NOTIF_SMS_KEY, list.slice(0, 200))
  appendActivity({ action: 'SMS queued (TODO: SMS API)', detail: sms.to, channel: 'sms' })
}

export function recordPush(push) {
  const list = readJson(NOTIF_PUSH_KEY, [])
  list.unshift({ ...push, id: `push-${Date.now()}`, sentAt: new Date().toISOString(), status: 'scheduled' })
  writeJson(NOTIF_PUSH_KEY, list.slice(0, 100))
  appendActivity({ action: 'Push scheduled (TODO: FCM API)', detail: push.title, channel: 'push' })
}

export function getAnnouncements() {
  return readJson(NOTIF_ANNOUNCEMENTS_KEY, [])
}

export function saveAnnouncement(announcement) {
  const list = getAnnouncements()
  const entry = { ...announcement, id: announcement.id || `ann-${Date.now()}`, createdAt: new Date().toISOString() }
  list.unshift(entry)
  writeJson(NOTIF_ANNOUNCEMENTS_KEY, list.slice(0, 20))
  appendActivity({ action: 'Announcement created', detail: entry.title })
  return entry
}

export function getAutomationRules() {
  return readJson(NOTIF_AUTOMATION_KEY, [
    { id: 'auto-order', event: 'Order Placed', channel: 'Email', enabled: true, todo: true },
    { id: 'auto-delivered', event: 'Order Delivered', channel: 'Email', enabled: true, todo: true },
    { id: 'auto-payment', event: 'Payment Success', channel: 'Email + Push', enabled: true, todo: true },
    { id: 'auto-refund', event: 'Refund', channel: 'Email', enabled: false, todo: true },
    { id: 'auto-stock', event: 'Low Stock', channel: 'Email + SMS', enabled: true, todo: true },
    { id: 'auto-customer', event: 'New Customer', channel: 'Welcome Email', enabled: true, todo: true },
    { id: 'auto-coupon', event: 'Coupon Expired', channel: 'Email', enabled: false, todo: true },
  ])
}

export function saveAutomationRules(rules) {
  writeJson(NOTIF_AUTOMATION_KEY, rules)
}

export function exportNotificationsCsv(notifications) {
  const header = ['Title', 'Type', 'Priority', 'Recipient', 'Status', 'Created']
  const rows = notifications.map((n) =>
    [n.title, n.type, n.priority, n.recipient, n.status, n.createdAt]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(','),
  )
  downloadTextFile(`notifications-${new Date().toISOString().slice(0, 10)}.csv`, [header.join(','), ...rows].join('\n'))
}

export function formatNotifDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getWhatsAppLink(message = '') {
  const text = message || 'Hi Namo Print, I am interested in your products.'
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}
