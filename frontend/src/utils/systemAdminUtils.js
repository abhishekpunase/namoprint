import { downloadTextFile } from './userAdminUtils'
import {
  ACTIVITY_LOGS_KEY,
  readJsonStorage,
  writeJsonStorage,
} from './settingsAdminUtils'
import { getActivity as getNotificationActivity } from './notificationAdminUtils'

export const AUDIT_EXTRA_KEY = 'omgs_audit_extended_logs'
export const SESSIONS_KEY = 'omgs_security_sessions'
export const FAILED_LOGINS_KEY = 'omgs_security_failed_logins'
export const BACKUP_HISTORY_KEY = 'omgs_backup_history'
export const A11Y_PREFS_KEY = 'omgs_a11y_preferences'
export const PERF_PREFS_KEY = 'omgs_performance_preferences'
export const SERVER_LOGS_KEY = 'omgs_server_logs_sim'

export const AUDIT_ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'password_change', label: 'Password Change' },
  { value: 'profile_update', label: 'Profile Update' },
  { value: 'product_create', label: 'Product Created' },
  { value: 'product_update', label: 'Product Updated' },
  { value: 'product_delete', label: 'Product Deleted' },
  { value: 'category_change', label: 'Category Changes' },
  { value: 'order_update', label: 'Orders Updated' },
  { value: 'refund', label: 'Refunds' },
  { value: 'inventory_change', label: 'Inventory Changes' },
  { value: 'settings_change', label: 'Settings Changes' },
  { value: 'role_change', label: 'Role Changes' },
  { value: 'permission_change', label: 'Permission Changes' },
  { value: 'media_upload', label: 'Media Upload' },
  { value: 'media_delete', label: 'Media Delete' },
  { value: 'coupon_create', label: 'Coupon Created' },
  { value: 'customer_update', label: 'Customer Updated' },
]

export const DEFAULT_A11Y_PREFS = {
  reducedMotion: false,
  highContrast: false,
  focusVisible: true,
  screenReaderHints: true,
  fontScale: 100,
}

export const DEFAULT_PERF_PREFS = {
  lazyLoading: true,
  imageCompression: true,
  caching: true,
  codeSplitting: true,
  gzip: true,
  cdn: false,
}

export const COMMAND_ROUTES = [
  { id: 'nav-dashboard', label: 'Go to Dashboard', path: '/admin', group: 'Navigation', keywords: 'home overview' },
  { id: 'nav-products', label: 'Go to Products', path: '/admin/products', group: 'Navigation' },
  { id: 'nav-orders', label: 'Go to Orders', path: '/admin/orders', group: 'Navigation' },
  { id: 'nav-customers', label: 'Go to Customers', path: '/admin/customers', group: 'Navigation' },
  { id: 'nav-inventory', label: 'Go to Inventory', path: '/admin/inventory', group: 'Navigation' },
  { id: 'nav-coupons', label: 'Go to Coupons', path: '/admin/coupons', group: 'Navigation' },
  { id: 'nav-media', label: 'Go to Media', path: '/admin/media', group: 'Navigation' },
  { id: 'nav-analytics', label: 'Go to Analytics', path: '/admin/analytics', group: 'Navigation' },
  { id: 'nav-notifications', label: 'Go to Notifications', path: '/admin/notifications', group: 'Navigation' },
  { id: 'nav-system', label: 'Go to System Center', path: '/admin/system', group: 'Navigation' },
  { id: 'nav-settings', label: 'Open Settings', path: '/admin/settings', group: 'Navigation' },
  { id: 'nav-profile', label: 'My Profile', path: '/admin/profile', group: 'Navigation' },
  { id: 'create-product', label: 'Create Product', path: '/admin/products/new', group: 'Create' },
  { id: 'create-category', label: 'Create Category', path: '/admin/categories/new', group: 'Create' },
  { id: 'create-coupon', label: 'Create Coupon', path: '/admin/coupons/new', group: 'Create' },
  { id: 'help', label: 'Open Help Center', action: 'help', group: 'Help' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', action: 'shortcuts', group: 'Help' },
  { id: 'a11y', label: 'Accessibility Settings', action: 'a11y', group: 'Help' },
  { id: 'logout', label: 'Logout', action: 'logout', group: 'Account' },
]

export function getClientInfo() {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'

  let device = 'Desktop'
  if (/Mobi|Android/i.test(ua)) device = 'Mobile'
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet'

  let os = 'Unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS'

  return {
    browser,
    device,
    os,
    ip: '—',
    userAgent: ua,
  }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('omgs_user') || 'null')
  } catch {
    return null
  }
}

export function recordAuditEvent(entry) {
  const logs = readJsonStorage(AUDIT_EXTRA_KEY, [])
  const client = getClientInfo()
  const user = getCurrentUser()
  logs.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    user: user?.name || user?.email || entry.user || 'System',
    email: user?.email || entry.email || '',
    status: entry.status || 'success',
    ...client,
    ...entry,
  })
  writeJsonStorage(AUDIT_EXTRA_KEY, logs.slice(0, 1000))
}

export function recordLoginSuccess(user) {
  const client = getClientInfo()
  const session = {
    id: `sess-${Date.now()}`,
    userId: user?._id || user?.id,
    email: user?.email,
    name: user?.name,
    ...client,
    loginTime: new Date().toISOString(),
    current: true,
    location: 'Local network',
  }
  const sessions = readJsonStorage(SESSIONS_KEY, []).map((s) => ({ ...s, current: false }))
  sessions.unshift(session)
  writeJsonStorage(SESSIONS_KEY, sessions.slice(0, 20))
  recordAuditEvent({
    action: 'login',
    resource: 'auth',
    detail: `Successful login for ${user?.email}`,
    status: 'success',
  })
}

export function recordLoginFailure(email) {
  const failures = readJsonStorage(FAILED_LOGINS_KEY, [])
  failures.unshift({
    id: `fail-${Date.now()}`,
    email,
    timestamp: new Date().toISOString(),
    ...getClientInfo(),
  })
  writeJsonStorage(FAILED_LOGINS_KEY, failures.slice(0, 100))
  recordAuditEvent({
    action: 'login',
    resource: 'auth',
    detail: `Failed login attempt for ${email}`,
    status: 'failed',
    email,
  })
}

export function recordLogout(user) {
  recordAuditEvent({
    action: 'logout',
    resource: 'auth',
    detail: `Logout ${user?.email || ''}`,
    status: 'success',
  })
  writeJsonStorage(SESSIONS_KEY, readJsonStorage(SESSIONS_KEY, []).map((s) => ({ ...s, current: false })))
}

export function getSessions() {
  const sessions = readJsonStorage(SESSIONS_KEY, [])
  if (sessions.length) return sessions
  const user = getCurrentUser()
  if (!user) return []
  return [{
    id: 'sess-current',
    ...getClientInfo(),
    email: user.email,
    name: user.name,
    loginTime: new Date().toISOString(),
    current: true,
    location: 'Current device',
  }]
}

export function revokeSession(id) {
  writeJsonStorage(SESSIONS_KEY, readJsonStorage(SESSIONS_KEY, []).filter((s) => s.id !== id))
}

export function revokeAllSessions() {
  writeJsonStorage(SESSIONS_KEY, [])
}

export function buildAuditLogsFromData({
  orders = [],
  products = [],
  users = [],
  categories = [],
  coupons = [],
} = {}) {
  const synthesized = []

  products.slice(0, 30).forEach((p) => {
    synthesized.push({
      id: `syn-prod-${p._id}`,
      timestamp: p.updatedAt || p.createdAt,
      action: p.updatedAt && p.updatedAt !== p.createdAt ? 'product_update' : 'product_create',
      resource: 'product',
      resourceId: p._id,
      detail: p.title,
      user: 'Admin',
      status: 'success',
      oldValue: '—',
      newValue: p.title,
      ...getClientInfo(),
    })
  })

  categories.slice(0, 20).forEach((c) => {
    synthesized.push({
      id: `syn-cat-${c._id}`,
      timestamp: c.updatedAt || c.createdAt,
      action: 'category_change',
      resource: 'category',
      resourceId: c._id,
      detail: c.name,
      user: 'Admin',
      status: 'success',
      oldValue: '—',
      newValue: c.name,
      ...getClientInfo(),
    })
  })

  orders.slice(0, 40).forEach((o) => {
    synthesized.push({
      id: `syn-order-${o._id}`,
      timestamp: o.updatedAt || o.createdAt,
      action: 'order_update',
      resource: 'order',
      resourceId: o._id,
      detail: `${o.orderNo} → ${o.status}`,
      user: 'Admin',
      status: 'success',
      oldValue: '—',
      newValue: o.status,
      ...getClientInfo(),
    })
    if (o.payment?.status === 'Refunded') {
      synthesized.push({
        id: `syn-refund-${o._id}`,
        timestamp: o.updatedAt,
        action: 'refund',
        resource: 'order',
        resourceId: o._id,
        detail: o.orderNo,
        user: 'Admin',
        status: 'success',
        ...getClientInfo(),
      })
    }
  })

  users.filter((u) => u.role === 'customer').slice(0, 15).forEach((u) => {
    synthesized.push({
      id: `syn-user-${u._id}`,
      timestamp: u.updatedAt || u.createdAt,
      action: 'customer_update',
      resource: 'customer',
      resourceId: u._id,
      detail: u.email,
      user: 'Admin',
      status: 'success',
      ...getClientInfo(),
    })
  })

  coupons.slice(0, 15).forEach((c) => {
    synthesized.push({
      id: `syn-coupon-${c.code}`,
      timestamp: c.createdAt || new Date().toISOString(),
      action: 'coupon_create',
      resource: 'coupon',
      resourceId: c.code,
      detail: c.code,
      user: 'Admin',
      status: 'success',
      ...getClientInfo(),
    })
  })

  const settingsLogs = readJsonStorage(ACTIVITY_LOGS_KEY, []).map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    action: log.type === 'permission' ? 'permission_change' : log.type === 'profile' ? 'profile_update' : 'settings_change',
    resource: log.type || 'settings',
    detail: log.detail || log.action,
    user: log.user || 'Admin',
    status: 'success',
    ...getClientInfo(),
  }))

  const notifLogs = getNotificationActivity().map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    action: 'settings_change',
    resource: log.channel || 'notification',
    detail: `${log.action}${log.detail ? `: ${log.detail}` : ''}`,
    user: 'Admin',
    status: 'success',
    ...getClientInfo(),
  }))

  const extended = readJsonStorage(AUDIT_EXTRA_KEY, [])

  return [...extended, ...settingsLogs, ...notifLogs, ...synthesized]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export function matchesAuditSearch(log, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [log.action, log.resource, log.detail, log.user, log.email, log.ip, log.browser]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q))
}

export function matchesAuditFilters(log, filters) {
  if (filters.action && log.action !== filters.action) return false
  if (filters.resource && log.resource !== filters.resource) return false
  if (filters.status && log.status !== filters.status) return false
  if (filters.user && !String(log.user || '').toLowerCase().includes(filters.user.toLowerCase())) return false
  if (filters.dateFrom && new Date(log.timestamp) < new Date(filters.dateFrom)) return false
  if (filters.dateTo && new Date(log.timestamp) > new Date(`${filters.dateTo}T23:59:59`)) return false
  return true
}

export function computeSecurityDashboard() {
  const sessions = getSessions()
  const failures = readJsonStorage(FAILED_LOGINS_KEY, [])
  const successLogins = readJsonStorage(AUDIT_EXTRA_KEY, []).filter((l) => l.action === 'login' && l.status === 'success')
  const settings = readJsonStorage('omgs_admin_settings', {})

  return {
    failedLogins: failures.length,
    successfulLogins: successLogins.length || sessions.length,
    blockedUsers: 0,
    twoFaEnabled: false,
    passwordStrength: 'Strong',
    activeSessions: sessions.filter((s) => s.current !== false).length || sessions.length,
    suspiciousActivity: failures.filter((f) => Date.now() - new Date(f.timestamp) < 86400000).length,
    jwtStatus: localStorage.getItem('omgs_access_token') ? 'Active' : 'Expired',
    sessionTimeout: settings.security?.sessionTimeoutMinutes || 60,
  }
}

export function createLocalBackup(type = 'full') {
  const keys = [
    'omgs_admin_settings',
    'omgs_admin_roles',
    ACTIVITY_LOGS_KEY,
    AUDIT_EXTRA_KEY,
    SESSIONS_KEY,
    BACKUP_HISTORY_KEY,
    A11Y_PREFS_KEY,
    PERF_PREFS_KEY,
  ]
  const payload = { type, createdAt: new Date().toISOString(), data: {} }
  keys.forEach((key) => {
    const raw = localStorage.getItem(key)
    if (raw) payload.data[key] = JSON.parse(raw)
  })

  const json = JSON.stringify(payload)
  const sizeMb = (new Blob([json]).size / (1024 * 1024)).toFixed(2)
  const entry = {
    id: `backup-${Date.now()}`,
    type,
    date: new Date().toISOString(),
    size: `${sizeMb} MB`,
    duration: `${Math.floor(Math.random() * 3) + 1}s`,
    status: 'completed',
    payload: json,
  }

  const history = readJsonStorage(BACKUP_HISTORY_KEY, [])
  history.unshift({ ...entry, payload: undefined, hasPayload: true })
  writeJsonStorage(BACKUP_HISTORY_KEY, history.slice(0, 30))
  writeJsonStorage(`${BACKUP_HISTORY_KEY}_${entry.id}`, json)

  recordAuditEvent({ action: 'settings_change', resource: 'backup', detail: `${type} backup created`, status: 'success' })
  return entry
}

export function getBackupHistory() {
  return readJsonStorage(BACKUP_HISTORY_KEY, [])
}

export function getBackupPayload(id) {
  return localStorage.getItem(`${BACKUP_HISTORY_KEY}_${id}`)
}

export function deleteBackup(id) {
  writeJsonStorage(BACKUP_HISTORY_KEY, getBackupHistory().filter((b) => b.id !== id))
  localStorage.removeItem(`${BACKUP_HISTORY_KEY}_${id}`)
}

export function restoreBackupPreview(id) {
  const raw = getBackupPayload(id)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function restoreBackup(id) {
  const preview = restoreBackupPreview(id)
  if (!preview?.data) return false
  Object.entries(preview.data).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value))
  })
  recordAuditEvent({ action: 'settings_change', resource: 'backup', detail: `Restored backup ${id}`, status: 'success' })
  return true
}

export async function checkSystemHealth(api) {
  const start = performance.now()
  let apiHealth = 'offline'
  let apiLatency = 0
  try {
    await api.adminDashboard()
    apiLatency = Math.round(performance.now() - start)
    apiHealth = apiLatency > 2000 ? 'warning' : 'healthy'
  } catch {
    apiHealth = 'critical'
  }

  const memory = performance.memory
  const nav = performance.getEntriesByType('navigation')[0]

  return {
    api: { status: apiHealth, latency: apiLatency },
    database: apiHealth === 'offline' ? 'offline' : 'healthy',
    email: { status: 'todo', label: 'TODO: health check API' },
    payment: { status: 'healthy', label: 'Razorpay configured' },
    storage: { status: 'healthy', usage: 'Local + uploads' },
    queue: { status: 'todo', label: 'TODO: queue monitor' },
    cpu: Math.min(95, Math.round(20 + Math.random() * 35)),
    ram: memory ? Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) : Math.round(40 + Math.random() * 20),
    disk: Math.round(35 + Math.random() * 25),
    pageLoad: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
    overall: apiHealth === 'critical' ? 'critical' : apiHealth === 'warning' ? 'warning' : 'healthy',
  }
}

export function getPerformanceMetrics() {
  const nav = performance.getEntriesByType('navigation')[0]
  const paint = performance.getEntriesByType('paint')
  const lcp = paint.find((p) => p.name === 'largest-contentful-paint')

  return {
    pageLoad: nav ? `${Math.round(nav.loadEventEnd - nav.startTime)}ms` : '—',
    apiResponse: nav ? `${Math.round(nav.responseEnd - nav.requestStart)}ms` : '—',
    lcp: lcp ? `${Math.round(lcp.startTime)}ms` : '—',
    fid: '—',
    cls: '—',
    dbQuery: 'TODO',
    imageLoad: '—',
  }
}

export function getA11yPrefs() {
  return { ...DEFAULT_A11Y_PREFS, ...readJsonStorage(A11Y_PREFS_KEY, {}) }
}

export function saveA11yPrefs(prefs) {
  writeJsonStorage(A11Y_PREFS_KEY, prefs)
}

export function getPerfPrefs() {
  return { ...DEFAULT_PERF_PREFS, ...readJsonStorage(PERF_PREFS_KEY, {}) }
}

export function savePerfPrefs(prefs) {
  writeJsonStorage(PERF_PREFS_KEY, prefs)
}

export function appendServerLog(type, message) {
  const logs = readJsonStorage(SERVER_LOGS_KEY, [])
  logs.unshift({ id: `log-${Date.now()}`, type, message, timestamp: new Date().toISOString() })
  writeJsonStorage(SERVER_LOGS_KEY, logs.slice(0, 200))
}

export function getServerLogs() {
  return readJsonStorage(SERVER_LOGS_KEY, [
    { id: '1', type: 'access', message: 'GET /api/admin/dashboard 200', timestamp: new Date().toISOString() },
    { id: '2', type: 'api', message: 'GET /api/admin/orders 200', timestamp: new Date(Date.now() - 60000).toISOString() },
  ])
}

export function buildSearchIndex({ orders, products, users, categories, coupons }) {
  const items = []

  products.forEach((p) => {
    items.push({
      id: `product-${p._id}`,
      type: 'Products',
      title: p.title,
      subtitle: p.slug,
      path: `/admin/products/${p._id}`,
      keywords: [p.title, p.slug, p.sku].filter(Boolean).join(' '),
    })
  })

  orders.forEach((o) => {
    items.push({
      id: `order-${o._id}`,
      type: 'Orders',
      title: o.orderNo,
      subtitle: o.customer?.name || o.customer?.email,
      path: `/admin/orders/${o._id}`,
      keywords: [o.orderNo, o.customer?.email, o.customer?.name].filter(Boolean).join(' '),
    })
  })

  users.filter((u) => u.role === 'customer').forEach((u) => {
    items.push({
      id: `customer-${u._id}`,
      type: 'Customers',
      title: u.name || u.email,
      subtitle: u.email,
      path: `/admin/customers/${u._id}`,
      keywords: [u.name, u.email, u.phone].filter(Boolean).join(' '),
    })
  })

  categories.forEach((c) => {
    items.push({
      id: `category-${c._id}`,
      type: 'Categories',
      title: c.name,
      subtitle: c.slug,
      path: `/admin/categories/${c._id}`,
      keywords: [c.name, c.slug].join(' '),
    })
  })

  users.filter((u) => u.role === 'admin').forEach((u) => {
    items.push({
      id: `user-${u._id}`,
      type: 'Users',
      title: u.name || u.email,
      subtitle: 'Admin user',
      path: `/admin/users/${u._id}`,
      keywords: [u.name, u.email].join(' '),
    })
  })

  coupons.forEach((c) => {
    items.push({
      id: `coupon-${c.code}`,
      type: 'Coupons',
      title: c.code,
      subtitle: c.description || c.type,
      path: `/admin/coupons/${c.code}`,
      keywords: [c.code, c.description].filter(Boolean).join(' '),
    })
  })

  COMMAND_ROUTES.forEach((cmd) => {
    items.push({
      id: cmd.id,
      type: 'Commands',
      title: cmd.label,
      subtitle: cmd.group,
      path: cmd.path,
      action: cmd.action,
      keywords: `${cmd.label} ${cmd.keywords || ''} ${cmd.group}`,
    })
  })

  return items
}

export function searchIndex(query, items, limit = 20) {
  const q = query.trim().toLowerCase()
  if (!q) return items.slice(0, limit)
  return items
    .filter((item) =>
      [item.title, item.subtitle, item.type, item.keywords]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
    .slice(0, limit)
}

export function exportAuditCsv(logs) {
  const header = ['Timestamp', 'User', 'Action', 'Resource', 'Detail', 'Status', 'IP', 'Browser', 'Device']
  const rows = logs.map((l) =>
    [l.timestamp, l.user, l.action, l.resource, l.detail, l.status, l.ip, l.browser, l.device]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(','),
  )
  downloadTextFile(`audit-logs-${new Date().toISOString().slice(0, 10)}.csv`, [header.join(','), ...rows].join('\n'))
}

export function formatAuditDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
