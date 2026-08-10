import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { appendActivityLog } from '../utils/settingsAdminUtils'
import {
  DEFAULT_CUSTOMER_COLUMNS,
  addCustomerNote,
  deleteCustomerNote,
  enrichCustomer,
  exportCustomersCsv,
  exportCustomersExcel,
  getCustomerId,
  getCustomerNotes,
  getUniqueLocations,
  matchesCustomerFilters,
  matchesCustomerSearch,
  printCustomersTable,
  setCustomerMeta,
} from '../utils/customerAdminUtils'
import { downloadTextFile } from '../utils/userAdminUtils'

export function useCustomerList() {
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_CUSTOMER_COLUMNS)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({
    segment: '',
    status: '',
    country: '',
    state: '',
    city: '',
    dateFrom: '',
    dateTo: '',
    ordersMin: '',
    ordersMax: '',
    ltvMin: '',
    ltvMax: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [usersPayload, ordersPayload] = await Promise.all([
        api.adminUsers('?limit=100'),
        api.adminOrders(),
      ])
      const allUsers = usersPayload.users || []
      const allOrders = ordersPayload.orders || []
      setOrders(allOrders)
      const onlyCustomers = allUsers
        .filter((u) => u.role === 'customer')
        .map((u) => enrichCustomer(u, allOrders))
      setCustomers(onlyCustomers)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const refresh = useCallback(() => {
    setRefreshing(true)
    load()
  }, [load])

  const filtered = useMemo(() => {
    let list = [...customers]
    if (search.trim()) list = list.filter((c) => matchesCustomerSearch(c, search))
    list = list.filter((c) => matchesCustomerFilters(c, filters))

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
        case 'orders':
          left = a.stats?.totalOrders || 0
          right = b.stats?.totalOrders || 0
          break
        case 'ltv':
          left = a.stats?.lifetimeValue || 0
          right = b.stats?.lifetimeValue || 0
          break
        case 'city':
          left = a.location?.city || ''
          right = b.location?.city || ''
          break
        case 'country':
          left = a.location?.country || ''
          right = b.location?.country || ''
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
  }, [customers, search, filters, sortKey, sortDir])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const locations = useMemo(() => getUniqueLocations(customers), [customers])

  const analytics = useMemo(() => {
    const total = filtered.length
    const active = filtered.filter((c) => c.isActive !== false).length
    const vip = filtered.filter((c) => c.meta?.vip).length
    const revenue = filtered.reduce((sum, c) => sum + (c.stats?.lifetimeValue || 0), 0)
    const totalOrders = filtered.reduce((sum, c) => sum + (c.stats?.totalOrders || 0), 0)
    return { total, active, vip, revenue, totalOrders }
  }, [filtered])

  const toggleSelect = useCallback((id) => {
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
  }, [])

  const toggleSelectAll = useCallback(() => {
    const ids = paginated.map(getCustomerId)
    setSelected((current) => (current.length === ids.length ? [] : ids))
  }, [paginated])

  const getExportRows = useCallback(() => {
    if (selected.length) return filtered.filter((c) => selected.includes(getCustomerId(c)))
    return filtered
  }, [filtered, selected])

  const exportCsv = useCallback(() => {
    downloadTextFile(`customers-${new Date().toISOString().slice(0, 10)}.csv`, exportCustomersCsv(getExportRows()))
  }, [getExportRows])

  const exportExcel = useCallback(() => {
    exportCustomersExcel(getExportRows())
  }, [getExportRows])

  const printList = useCallback(() => {
    printCustomersTable(getExportRows())
  }, [getExportRows])

  const toggleBlock = useCallback(
    async (customer) => {
      const id = getCustomerId(customer)
      await api.adminUpdateUserStatus(id, { isActive: !customer.isActive })
      appendActivityLog({
        type: 'customer',
        action: customer.isActive !== false ? 'Customer blocked' : 'Customer unblocked',
        detail: customer.email,
        user: 'Admin',
      })
      load()
    },
    [load],
  )

  const bulkBlock = useCallback(
    async (block = true) => {
      const rows = filtered.filter((c) => selected.includes(getCustomerId(c)))
      await Promise.all(
        rows.map((c) => api.adminUpdateUserStatus(getCustomerId(c), { isActive: !block })),
      )
      setSelected([])
      load()
    },
    [filtered, selected, load],
  )

  const markVip = useCallback((customerId, vip = true) => {
    setCustomerMeta(customerId, { vip })
    setCustomers((current) =>
      current.map((c) =>
        getCustomerId(c) === customerId ? { ...c, meta: { ...c.meta, vip } } : c,
      ),
    )
  }, [])

  return {
    customers,
    orders,
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
    locations,
    analytics,
    load,
    refresh,
    refreshing,
    toggleSelect,
    toggleSelectAll,
    exportCsv,
    exportExcel,
    printList,
    toggleBlock,
    bulkBlock,
    markVip,
  }
}

export function useCustomerDetail(customerId) {
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [notes, setNotes] = useState([])

  const load = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    setError('')
    try {
      const payload = await api.adminUser(customerId)
      if (payload.user?.role !== 'customer') {
        setError('This account is not a storefront customer.')
        setCustomer(payload.user)
        setOrders(payload.orders || [])
        return
      }
      const enriched = enrichCustomer(payload.user, payload.orders || [])
      setCustomer(enriched)
      setOrders(payload.orders || [])
      setNotes(getCustomerNotes(customerId))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    load()
  }, [load])

  const toggleBlock = useCallback(async () => {
    if (!customer) return
    setSaving(true)
    try {
      const payload = await api.adminUpdateUserStatus(getCustomerId(customer), {
        isActive: !customer.isActive,
      })
      setCustomer(enrichCustomer(payload.user, orders))
      appendActivityLog({
        type: 'customer',
        action: customer.isActive !== false ? 'Customer blocked' : 'Customer unblocked',
        detail: customer.email,
        user: 'Admin',
      })
      setMessage(customer.isActive !== false ? 'Customer blocked.' : 'Customer unblocked.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [customer, orders])

  const addNote = useCallback(
    (text, pinned) => {
      const note = addCustomerNote(customerId, text, pinned)
      setNotes((current) => [note, ...current])
      setMessage('Note saved.')
    },
    [customerId],
  )

  const removeNote = useCallback(
    (noteId) => {
      deleteCustomerNote(customerId, noteId)
      setNotes((current) => current.filter((n) => n.id !== noteId))
    },
    [customerId],
  )

  const updateMeta = useCallback(
    (patch) => {
      setCustomerMeta(customerId, patch)
      setCustomer((current) => (current ? { ...current, meta: { ...current.meta, ...patch } } : current))
      setMessage('Customer metadata updated locally.')
    },
    [customerId],
  )

  return {
    customer,
    orders,
    notes,
    loading,
    error,
    saving,
    message,
    load,
    toggleBlock,
    addNote,
    removeNote,
    updateMeta,
    setMessage,
    setError,
  }
}
