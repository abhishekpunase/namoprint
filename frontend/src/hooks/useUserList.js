import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { appendActivityLog } from '../utils/settingsAdminUtils'
import {
  DEFAULT_USER_COLUMNS,
  downloadTextFile,
  exportUsersCsv,
  getUserId,
  getUserMeta,
  matchesUserSearch,
  printUsersTable,
  setUserMeta,
} from '../utils/userAdminUtils'

export function useUserList(options = {}) {
  const { defaultRole = '' } = options
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_USER_COLUMNS)
  const [filters, setFilters] = useState({ role: defaultRole, status: '', department: '' })
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (q = search) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      params.set('page', '1')
      params.set('limit', '100')
      const query = params.toString() ? `?${params.toString()}` : ''
      const payload = await api.adminUsers(query)
      setUsers(payload.users || [])
      setPagination(payload.pagination || { page: 1, limit: 100, total: payload.users?.length || 0 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [search])

  useEffect(() => {
    load()
  }, [load])

  const refresh = useCallback(() => {
    setRefreshing(true)
    load()
  }, [load])

  const filtered = useMemo(() => {
    let list = [...users]
    if (search.trim()) list = list.filter((u) => matchesUserSearch(u, search))
    if (filters.role) list = list.filter((u) => u.role === filters.role)
    if (filters.status === 'active') list = list.filter((u) => u.isActive !== false)
    if (filters.status === 'disabled') list = list.filter((u) => u.isActive === false)
    if (filters.department) {
      list = list.filter((u) => getUserMeta(getUserId(u)).department === filters.department)
    }

    list.sort((a, b) => {
      let left
      let right
      switch (sortKey) {
        case 'name':
          left = a.name || ''
          right = b.name || ''
          break
        case 'email':
          left = a.email || ''
          right = b.email || ''
          break
        case 'role':
          left = a.role || ''
          right = b.role || ''
          break
        default:
          left = new Date(a.createdAt || 0).getTime()
          right = new Date(b.createdAt || 0).getTime()
      }
      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [users, search, filters, sortKey, sortDir])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const toggleStatus = useCallback(
    async (user) => {
      const id = getUserId(user)
      await api.adminUpdateUserStatus(id, { isActive: !user.isActive })
      appendActivityLog({
        type: 'user',
        action: user.isActive !== false ? 'User disabled' : 'User enabled',
        detail: user.email,
        user: 'Admin',
      })
      load()
    },
    [load],
  )

  const toggleSelect = useCallback((id) => {
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
  }, [])

  const toggleSelectAll = useCallback(() => {
    const ids = paginated.map(getUserId)
    setSelected((current) => (current.length === ids.length ? [] : ids))
  }, [paginated])

  const exportCsv = useCallback(() => {
    const rows = selected.length ? filtered.filter((u) => selected.includes(getUserId(u))) : filtered
    downloadTextFile('users-export.csv', exportUsersCsv(rows))
  }, [filtered, selected])

  const exportExcel = useCallback(() => {
    exportCsv()
  }, [exportCsv])

  const printList = useCallback(() => {
    const rows = selected.length ? filtered.filter((u) => selected.includes(getUserId(u))) : filtered
    printUsersTable(rows)
  }, [filtered, selected])

  const departments = useMemo(() => {
    const set = new Set()
    users.forEach((u) => {
      const d = getUserMeta(getUserId(u)).department
      if (d) set.add(d)
    })
    return [...set]
  }, [users])

  return {
    users,
    pagination,
    loading,
    error,
    search,
    setSearch,
    selected,
    setSelected,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortKey,
    setSortKey,
    sortDir,
    setSortDir,
    visibleColumns,
    setVisibleColumns,
    filters,
    setFilters,
    filtered,
    paginated,
    total: filtered.length,
    load,
    refresh,
    refreshing,
    toggleStatus,
    toggleSelect,
    toggleSelectAll,
    exportCsv,
    exportExcel,
    printList,
    departments,
    setUserMeta,
  }
}

export function useUserDetail(userId) {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const payload = await api.adminUser(userId)
      setUser(payload.user)
      setOrders(payload.orders || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const toggleStatus = useCallback(async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = await api.adminUpdateUserStatus(getUserId(user), { isActive: !user.isActive })
      setUser(payload.user)
      appendActivityLog({
        type: 'user',
        action: user.isActive !== false ? 'User disabled' : 'User enabled',
        detail: user.email,
        user: 'Admin',
      })
      setMessage('User status updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [user])

  const updateMeta = useCallback(
    (patch) => {
      if (!user) return
      setUserMeta(getUserId(user), patch)
      setMessage('Profile metadata saved locally. TODO: backend user profile API.')
    },
    [user],
  )

  const meta = user ? getUserMeta(getUserId(user)) : {}

  return {
    user,
    orders,
    meta,
    loading,
    error,
    saving,
    message,
    load,
    toggleStatus,
    updateMeta,
    setMessage,
    setError,
  }
}

export function useProfileSettings() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialDate: '', specialDateLabel: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await api.profile()
      setProfile(payload.user)
      setForm({
        name: payload.user.name || '',
        email: payload.user.email || '',
        phone: payload.user.phone || '',
        specialDate: payload.user.specialDate ? payload.user.specialDate.slice(0, 10) : '',
        specialDateLabel: payload.user.specialDateLabel || '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveProfile = useCallback(async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = await api.updateProfile({
        name: form.name,
        phone: form.phone,
        specialDate: form.specialDate || undefined,
        specialDateLabel: form.specialDateLabel || undefined,
      })
      setProfile(payload.user)
      appendActivityLog({
        type: 'profile',
        action: 'Profile updated',
        detail: payload.user.email,
        user: payload.user.name,
      })
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [form])

  return { profile, form, setForm, loading, saving, error, message, load, saveProfile, setMessage }
}
