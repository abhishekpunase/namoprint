import { readJsonStorage, USER_META_KEY } from './settingsAdminUtils'

export const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'customer', label: 'Customer' },
]

export const USER_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
]

export const DEFAULT_USER_COLUMNS = ['avatar', 'name', 'email', 'phone', 'role', 'department', 'status', 'lastLogin', 'createdAt', 'actions']

export function getUserId(user) {
  return user?._id || user?.id
}

export function getUserInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?'
}

export function formatUserDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getUserMeta(userId) {
  const all = readJsonStorage(USER_META_KEY, {})
  return all[userId] || { department: '', lastLogin: null, uiRole: '' }
}

export function setUserMeta(userId, patch) {
  const all = readJsonStorage(USER_META_KEY, {})
  all[userId] = { ...(all[userId] || {}), ...patch }
  localStorage.setItem(USER_META_KEY, JSON.stringify(all))
  return all[userId]
}

export function matchesUserSearch(user, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const meta = getUserMeta(getUserId(user))
  return [user.name, user.email, user.phone, user.role, meta.department, meta.uiRole]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q))
}

export function exportUsersCsv(users) {
  const header = ['Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Created']
  const rows = users.map((u) => {
    const meta = getUserMeta(getUserId(u))
    return [
      u.name,
      u.email,
      u.phone || '',
      u.role,
      meta.department || '',
      u.isActive !== false ? 'Active' : 'Disabled',
      u.createdAt ? new Date(u.createdAt).toISOString() : '',
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(',')
  })
  return [header.join(','), ...rows].join('\n')
}

export function downloadTextFile(filename, content, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function printUsersTable(users) {
  const html = `<html><head><title>Users</title><style>
    body{font-family:Arial,sans-serif;padding:24px} table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px} th{background:#f5f5f5}
  </style></head><body><h1>User Export</h1><table><thead><tr>
    <th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th>
  </tr></thead><tbody>${users
    .map(
      (u) => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.phone || '—'}</td><td>${u.role}</td><td>${u.isActive !== false ? 'Active' : 'Disabled'}</td></tr>`,
    )
    .join('')}</tbody></table></body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}
