import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import {
  DEFAULT_COLUMNS,
  appendCouponActivity,
  computeCouponDashboard,
  couponToForm,
  deleteLocalDraft,
  downloadCouponExport,
  emptyCouponForm,
  enrichCoupon,
  formToLocalCoupon,
  getCouponActivity,
  getLocalDrafts,
  mergeCoupons,
  matchesCouponFilters,
  matchesCouponSearch,
  normalizeCode,
  printCouponsTable,
  saveLocalDraft,
  setCouponMeta,
} from '../utils/couponAdminUtils'

export function useCouponList() {
  const [coupons, setCoupons] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState('code')
  const [sortDir, setSortDir] = useState('asc')
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({ status: '', type: '', automatic: '', source: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [couponPayload, ordersPayload] = await Promise.all([api.coupons(), api.adminOrders()])
      const merged = mergeCoupons(couponPayload.coupons || [], getLocalDrafts(), ordersPayload.orders || [])
      setCoupons(merged)
      setOrders(ordersPayload.orders || [])
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
    let list = [...coupons]
    if (search.trim()) list = list.filter((c) => matchesCouponSearch(c, search))
    list = list.filter((c) => matchesCouponFilters(c, filters))

    list.sort((a, b) => {
      let left
      let right
      switch (sortKey) {
        case 'name':
          left = a.name || ''
          right = b.name || ''
          break
        case 'usage':
          left = a.usageCount
          right = b.usageCount
          break
        case 'value':
          left = a.value || 0
          right = b.value || 0
          break
        case 'status':
          left = a.status
          right = b.status
          break
        default:
          left = a.code
          right = b.code
      }
      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [coupons, search, filters, sortKey, sortDir])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const dashboard = useMemo(() => computeCouponDashboard(coupons, orders), [coupons, orders])

  const toggleSelect = useCallback((code) => {
    const id = normalizeCode(code)
    setSelected((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }, [])

  const toggleSelectAll = useCallback(() => {
    const ids = paginated.map((c) => c.code)
    setSelected((c) => (c.length === ids.length ? [] : ids))
  }, [paginated])

  const getExportRows = useCallback(() => {
    if (selected.length) return filtered.filter((c) => selected.includes(c.code))
    return filtered
  }, [filtered, selected])

  const disableCoupon = useCallback(
    (code) => {
      setCouponMeta(code, { disabled: true, status: 'disabled' })
      appendCouponActivity({ code, action: 'Coupon disabled', detail: 'Admin metadata' })
      load()
    },
    [load],
  )

  const enableCoupon = useCallback(
    (code) => {
      setCouponMeta(code, { disabled: false, status: 'active' })
      appendCouponActivity({ code, action: 'Coupon enabled', detail: 'Admin metadata' })
      load()
    },
    [load],
  )

  const archiveCoupon = useCallback(
    (code, coupon) => {
      if (coupon.source === 'local') deleteLocalDraft(code)
      setCouponMeta(code, { status: 'archived' })
      appendCouponActivity({ code, action: 'Coupon archived', detail: '' })
      load()
    },
    [load],
  )

  const duplicateCoupon = useCallback(
    (coupon) => {
      const copy = {
        ...coupon,
        code: `${coupon.code}_COPY`,
        name: `${coupon.name} (Copy)`,
        status: 'draft',
        source: 'local',
      }
      saveLocalDraft(copy)
      load()
      return copy.code
    },
    [load],
  )

  const bulkDisable = useCallback(
    (codes) => {
      codes.forEach((code) => setCouponMeta(code, { disabled: true, status: 'disabled' }))
      load()
    },
    [load],
  )

  const bulkEnable = useCallback(
    (codes) => {
      codes.forEach((code) => setCouponMeta(code, { disabled: false, status: 'active' }))
      load()
    },
    [load],
  )

  return {
    coupons,
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
    dashboard,
    load,
    refresh,
    refreshing,
    toggleSelect,
    toggleSelectAll,
    exportCsv: () => downloadCouponExport(getExportRows(), 'csv'),
    exportExcel: () => downloadCouponExport(getExportRows(), 'excel'),
    printList: () => printCouponsTable(getExportRows()),
    disableCoupon,
    enableCoupon,
    archiveCoupon,
    duplicateCoupon,
    bulkDisable,
    bulkEnable,
    saveLocalDraft,
  }
}

export function useCouponDetail(code) {
  const [coupon, setCoupon] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!code) return
    setLoading(true)
    setError('')
    try {
      const [couponPayload, ordersPayload] = await Promise.all([api.coupons(), api.adminOrders()])
      const allOrders = ordersPayload.orders || []
      const normalized = normalizeCode(code)
      const fromApi = (couponPayload.coupons || []).find((c) => normalizeCode(c.code) === normalized)
      const fromLocal = getLocalDrafts().find((c) => normalizeCode(c.code) === normalized)
      const raw = fromLocal || fromApi
      if (!raw) throw new Error('Coupon not found')
      setCoupon(enrichCoupon({ ...raw, source: fromLocal ? 'local' : 'backend' }, allOrders))
      setOrders(allOrders)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    load()
  }, [load])

  const activity = useMemo(() => getCouponActivity(code), [code, coupon])

  const topCustomers = useMemo(() => {
    if (!coupon) return []
    const map = new Map()
    coupon.usageOrders.forEach((o) => {
      const key = o.customer?.email || o.customer?.name || 'Guest'
      map.set(key, (map.get(key) || 0) + 1)
    })
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))
  }, [coupon])

  const topProducts = useMemo(() => {
    if (!coupon) return []
    const map = new Map()
    coupon.usageOrders.forEach((o) => {
      ;(o.items || []).forEach((item) => {
        const key = item.title || 'Product'
        map.set(key, (map.get(key) || 0) + (item.quantity || 0))
      })
    })
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name, qty }))
  }, [coupon])

  return { coupon, orders, activity, topCustomers, topProducts, loading, error, load }
}

export function useCouponForm(initialCode) {
  const [form, setForm] = useState(emptyCouponForm())
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!initialCode) return
    const normalized = normalizeCode(initialCode)
    const couponPayload = await api.coupons()
    const fromApi = (couponPayload.coupons || []).find((c) => normalizeCode(c.code) === normalized)
    const fromLocal = getLocalDrafts().find((c) => normalizeCode(c.code) === normalized)
    const raw = fromLocal || fromApi
    if (raw) {
      const enriched = enrichCoupon({ ...raw, source: fromLocal ? 'local' : 'backend' }, [])
      setForm({ ...couponToForm(enriched), isBackend: enriched.isBackend })
    }
  }, [initialCode])

  useEffect(() => {
    load()
  }, [load])

  const save = useCallback(
    async (publish = false) => {
      setSaving(true)
      setError('')
      setMessage('')
      try {
        if (!form.code.trim()) throw new Error('Coupon code is required')
        if (!form.name.trim()) throw new Error('Coupon name is required')
        const payload = formToLocalCoupon({ ...form, status: publish ? 'active' : form.status || 'draft' })

        if (form.isBackend) {
          setCouponMeta(form.code, {
            name: form.name,
            description: form.description,
            notes: form.notes,
            status: publish ? 'active' : form.status,
            startDate: form.startDate || null,
            expiryDate: form.expiryDate || null,
            maxUsage: form.maxUsage ? Number(form.maxUsage) : null,
          })
          setMessage('Metadata saved locally. Discount rules remain in backend constants (TODO: admin coupon API).')
        } else {
          saveLocalDraft(payload)
          setMessage(
            publish
              ? 'Coupon saved locally. TODO: POST /admin/coupons to activate at checkout.'
              : 'Draft saved locally.',
          )
        }
        appendCouponActivity({
          code: form.code,
          action: publish ? 'Coupon published (local)' : 'Coupon saved',
          detail: form.name,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setSaving(false)
      }
    },
    [form],
  )

  return { form, setForm, step, setStep, saving, message, error, save, setError, setMessage }
}
