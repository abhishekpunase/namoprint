import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import {
  buildActivityFeed,
  buildCategoryBarData,
  buildDistribution,
  buildRevenueSeries,
  buildTopProducts,
  computeInventoryValue,
  computeOrderMetrics,
  countNewUsers,
  filterOrdersByRange,
  flattenLowStock,
} from '../utils/dashboardMetrics'

const initialState = {
  dashboard: null,
  orders: [],
  users: [],
  products: [],
  categories: [],
}

export function useAdminDashboard() {
  const [data, setData] = useState(initialState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('30d')
  const [customRange, setCustomRange] = useState({ from: '', to: '' })
  const [revenuePeriod, setRevenuePeriod] = useState('monthly')
  const [pieMode, setPieMode] = useState('orders')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [dashboard, ordersPayload, usersPayload, productsPayload, categoriesPayload] = await Promise.all([
        api.adminDashboard(),
        api.adminOrders(),
        api.adminUsers('?limit=12'),
        api.adminProducts('?limit=12'),
        api.adminCategories(),
      ])

      setData({
        dashboard,
        orders: ordersPayload.orders || [],
        users: usersPayload.users || [],
        products: productsPayload.items || [],
        categories: categoriesPayload.categories || [],
      })
    } catch (err) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredOrders = useMemo(
    () => filterOrdersByRange(data.orders, range, customRange),
    [data.orders, range, customRange],
  )

  const stats = data.dashboard?.stats || {}
  const orderMetrics = useMemo(() => computeOrderMetrics(data.orders, stats), [data.orders, stats])

  const derived = useMemo(() => {
    const inventoryValue = computeInventoryValue(data.products)
    const newUsers = countNewUsers(data.users)
    const totalCategories = data.categories.length

    return {
      totalRevenue: stats.totalRevenue || 0,
      totalOrders: stats.totalOrders || 0,
      totalProducts: stats.totalProducts || 0,
      totalCustomers: stats.totalUsers || 0,
      pendingOrders: stats.pendingOrders || 0,
      completedOrders: orderMetrics.completedOrders,
      cancelledOrders: orderMetrics.cancelledOrders,
      totalCategories,
      inventoryValue,
      todaySales: orderMetrics.todaySales,
      monthlyRevenue: stats.monthlyRevenue || 0,
      newUsers,
    }
  }, [stats, orderMetrics, data.products, data.users, data.categories])

  const revenueSeries = useMemo(
    () => buildRevenueSeries(filteredOrders, revenuePeriod),
    [filteredOrders, revenuePeriod],
  )

  const pieData = useMemo(() => buildDistribution(filteredOrders, pieMode), [filteredOrders, pieMode])

  const barData = useMemo(
    () => buildCategoryBarData(filteredOrders, data.categories),
    [filteredOrders, data.categories],
  )

  const monthlyOrdersBar = useMemo(() => buildRevenueSeries(filteredOrders, 'monthly'), [filteredOrders])

  const inventoryBar = useMemo(() => {
    return data.products.slice(0, 6).map((product) => ({
      label: product.title?.slice(0, 12) || 'Product',
      value: (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0),
    }))
  }, [data.products])

  const topProducts = useMemo(
    () => buildTopProducts(data.products, data.orders),
    [data.products, data.orders],
  )

  const lowStock = useMemo(
    () => flattenLowStock(data.dashboard?.lowStockProducts || []),
    [data.dashboard?.lowStockProducts],
  )

  const recentOrders = useMemo(() => {
    const source = data.dashboard?.recentOrders?.length ? data.dashboard.recentOrders : data.orders
    if (!search.trim()) return source.slice(0, 10)
    const q = search.toLowerCase()
    return source
      .filter(
        (order) =>
          order.orderNo?.toLowerCase().includes(q) ||
          order.customer?.name?.toLowerCase().includes(q) ||
          order.customer?.email?.toLowerCase().includes(q),
      )
      .slice(0, 10)
  }, [data.dashboard?.recentOrders, data.orders, search])

  const latestCustomers = useMemo(() => data.users.filter((u) => u.role === 'customer').slice(0, 6), [data.users])

  const activity = useMemo(() => buildActivityFeed(data.orders, data.users), [data.orders, data.users])

  const exportSummary = useCallback(() => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', derived.totalRevenue],
      ['Total Orders', derived.totalOrders],
      ['Total Products', derived.totalProducts],
      ['Total Customers', derived.totalCustomers],
      ['Pending Orders', derived.pendingOrders],
      ['Monthly Revenue', derived.monthlyRevenue],
    ]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard-summary-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [derived])

  return {
    loading,
    error,
    reload: load,
    range,
    setRange,
    customRange,
    setCustomRange,
    revenuePeriod,
    setRevenuePeriod,
    pieMode,
    setPieMode,
    search,
    setSearch,
    derived,
    revenueSeries,
    pieData,
    barData,
    monthlyOrdersBar,
    inventoryBar,
    topProducts,
    lowStock,
    recentOrders,
    latestCustomers,
    activity,
    exportSummary,
  }
}
