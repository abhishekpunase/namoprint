import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { filterOrdersByRange } from '../utils/dashboardMetrics'
import {
  computeOrderAnalytics,
  getItemsCount,
  matchesOrderSearch,
  ORDER_STATUSES,
} from '../utils/orderAdminUtils'

const DEFAULT_COLUMNS = [
  'orderNo',
  'customer',
  'products',
  'items',
  'date',
  'paymentMethod',
  'paymentStatus',
  'shippingStatus',
  'orderStatus',
  'coupon',
  'total',
  'staff',
  'delivery',
  'actions',
]

export function useOrderList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS)
  const [density, setDensity] = useState('comfortable')
  const [filters, setFilters] = useState({
    dateRange: '',
    dateFrom: '',
    dateTo: '',
    orderStatus: '',
    paymentStatus: '',
    shippingStatus: '',
    paymentMethod: '',
    amountMin: '',
    amountMax: '',
    coupon: '',
    staff: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await api.adminOrders()
      setOrders(payload.orders || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    let list = [...orders]

    if (filters.dateRange) {
      list = filterOrdersByRange(list, filters.dateRange, {
        from: filters.dateFrom,
        to: filters.dateTo,
      })
    } else if (filters.dateFrom || filters.dateTo) {
      list = filterOrdersByRange(list, 'custom', {
        from: filters.dateFrom,
        to: filters.dateTo,
      })
    }

    if (filters.orderStatus) list = list.filter((o) => o.status === filters.orderStatus)
    if (filters.paymentStatus) list = list.filter((o) => o.payment?.status === filters.paymentStatus)
    if (filters.paymentMethod) {
      list = list.filter((o) => (o.payment?.provider || 'razorpay').toLowerCase() === filters.paymentMethod.toLowerCase())
    }
    if (filters.coupon === 'yes') list = list.filter((o) => Boolean(o.couponCode))
    if (filters.coupon === 'no') list = list.filter((o) => !o.couponCode)
    if (filters.amountMin) list = list.filter((o) => (o.totals?.total || 0) >= Number(filters.amountMin))
    if (filters.amountMax) list = list.filter((o) => (o.totals?.total || 0) <= Number(filters.amountMax))

    if (search.trim()) list = list.filter((o) => matchesOrderSearch(o, search))

    list.sort((a, b) => {
      let left
      let right
      switch (sortKey) {
        case 'orderNo':
          left = a.orderNo || ''
          right = b.orderNo || ''
          break
        case 'customer':
          left = a.customer?.name || ''
          right = b.customer?.name || ''
          break
        case 'total':
          left = a.totals?.total || 0
          right = b.totals?.total || 0
          break
        case 'items':
          left = getItemsCount(a)
          right = getItemsCount(b)
          break
        default:
          left = new Date(a.createdAt).getTime()
          right = new Date(b.createdAt).getTime()
      }
      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [orders, search, filters, sortKey, sortDir])

  const analytics = useMemo(() => computeOrderAnalytics(filtered), [filtered])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleSelectAll = () => {
    if (selected.length === paginated.length) setSelected([])
    else setSelected(paginated.map((o) => o._id))
  }

  const toggleSelect = (id) => {
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
  }

  const bulkUpdateStatus = async (status, note = 'Bulk status update') => {
    const targets = orders.filter((o) => selected.includes(o._id))
    for (const order of targets) {
      await api.adminUpdateOrderStatus(order._id, { status, note })
    }
    setSelected([])
    await load()
  }

  const exportRows = (rows) =>
    rows.map((order) => ({
      'Order No': order.orderNo,
      Customer: order.customer?.name,
      Email: order.customer?.email,
      Phone: order.customer?.phone,
      Items: getItemsCount(order),
      Total: order.totals?.total,
      Status: order.status,
      Payment: order.payment?.status,
      Coupon: order.couponCode || '',
      Date: order.createdAt,
    }))

  const exportCsv = (rows = filtered) => {
    const data = exportRows(rows)
    if (!data.length) return
    const headers = Object.keys(data[0])
    const csv = [headers.join(','), ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportExcel = (rows = filtered) => exportCsv(rows)
  const printTable = () => window.print()

  const updateOrderStatus = async (orderId, status) => {
    await api.adminUpdateOrderStatus(orderId, { status, note: `Status updated to ${status}` })
    await load()
  }

  return {
    orders,
    loading,
    error,
    search,
    setSearch,
    filters,
    setFilters,
    filtered,
    paginated,
    analytics,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    sortKey,
    setSortKey,
    sortDir,
    setSortDir,
    selected,
    toggleSelect,
    toggleSelectAll,
    visibleColumns,
    setVisibleColumns,
    density,
    setDensity,
    load,
    bulkUpdateStatus,
    exportCsv,
    exportExcel,
    printTable,
    updateOrderStatus,
    orderStatuses: ORDER_STATUSES,
  }
}
