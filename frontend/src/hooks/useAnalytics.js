import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import {
  buildCustomerAnalytics,
  buildInventoryAnalytics,
  buildMarketingAnalytics,
  buildOrdersTrend,
  buildPaymentAnalytics,
  buildProductAnalytics,
  buildRealTimeSnapshot,
  buildShippingAnalytics,
  computeGrowth,
  computeKpis,
  deleteSavedReport,
  exportReportCsv,
  filterOrdersByRangeExtended,
  generateReport,
  getGoals,
  getPreviousPeriodOrders,
  getSavedReports,
  saveGoals,
  saveReport,
} from '../utils/analyticsAdminUtils'
import { buildDistribution, buildRevenueSeries, buildTopProducts } from '../utils/dashboardMetrics'

export function useAnalytics() {
  const [dashboard, setDashboard] = useState(null)
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [range, setRange] = useState('30d')
  const [customRange, setCustomRange] = useState({ from: '', to: '' })
  const [compareMode, setCompareMode] = useState(false)
  const [revenuePeriod, setRevenuePeriod] = useState('monthly')
  const [chartMode, setChartMode] = useState('orders')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [goals, setGoalsState] = useState(getGoals())
  const [savedReports, setSavedReports] = useState(getSavedReports())

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [dashPayload, ordersPayload, usersPayload, productsPayload, categoriesPayload, couponsPayload] =
        await Promise.all([
          api.adminDashboard(),
          api.adminOrders(),
          api.adminUsers('?limit=100'),
          api.adminProducts('?limit=100'),
          api.adminCategories(),
          api.coupons().catch(() => ({ coupons: [] })),
        ])

      setDashboard(dashPayload)
      setOrders(ordersPayload.orders || [])
      setUsers(usersPayload.users || [])
      setProducts(productsPayload.items || productsPayload.products || [])
      setCategories(categoriesPayload.categories || [])
      setCoupons(couponsPayload.coupons || [])
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
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

  const stats = dashboard?.stats || {}

  const filteredOrders = useMemo(
    () => filterOrdersByRangeExtended(orders, range, customRange),
    [orders, range, customRange],
  )

  const previousOrders = useMemo(
    () => (compareMode ? getPreviousPeriodOrders(orders, range, customRange) : []),
    [orders, range, customRange, compareMode],
  )

  const kpis = useMemo(
    () =>
      computeKpis({
        orders: filteredOrders,
        products,
        users,
        stats,
        coupons,
      }),
    [filteredOrders, products, users, stats, coupons],
  )

  const previousKpis = useMemo(
    () => (compareMode ? computeKpis({ orders: previousOrders, products, users, stats: {}, coupons }) : null),
    [compareMode, previousOrders, products, users, coupons],
  )

  const growth = useMemo(() => {
    if (!previousKpis) return {}
    return {
      revenue: computeGrowth(kpis.totalRevenue, previousKpis.totalRevenue),
      orders: computeGrowth(kpis.totalOrders, previousKpis.totalOrders),
      aov: computeGrowth(kpis.averageOrderValue, previousKpis.averageOrderValue),
    }
  }, [kpis, previousKpis])

  const revenueSeries = useMemo(
    () => buildRevenueSeries(filteredOrders, revenuePeriod),
    [filteredOrders, revenuePeriod],
  )

  const ordersTrend = useMemo(
    () => buildOrdersTrend(filteredOrders, revenuePeriod === 'yearly' ? 'yearly' : 'daily'),
    [filteredOrders, revenuePeriod],
  )

  const pieData = useMemo(() => buildDistribution(filteredOrders, chartMode), [filteredOrders, chartMode])

  const productAnalytics = useMemo(
    () => buildProductAnalytics(products, filteredOrders),
    [products, filteredOrders],
  )

  const customerAnalytics = useMemo(
    () => buildCustomerAnalytics(users, filteredOrders),
    [users, filteredOrders],
  )

  const paymentAnalytics = useMemo(
    () => buildPaymentAnalytics(filteredOrders),
    [filteredOrders],
  )

  const shippingAnalytics = useMemo(
    () => buildShippingAnalytics(filteredOrders),
    [filteredOrders],
  )

  const inventoryAnalytics = useMemo(
    () => buildInventoryAnalytics(products, filteredOrders),
    [products, filteredOrders],
  )

  const marketingAnalytics = useMemo(
    () => buildMarketingAnalytics(filteredOrders, coupons),
    [filteredOrders, coupons],
  )

  const realtime = useMemo(
    () => buildRealTimeSnapshot(orders, users),
    [orders, users],
  )

  const topProducts = useMemo(
    () => buildTopProducts(products, filteredOrders),
    [products, filteredOrders],
  )

  const categoryBar = useMemo(() => {
    return categories.slice(0, 8).map((c) => ({
      label: c.name,
      value: filteredOrders.filter((o) =>
        o.items?.some((item) => String(item.title || '').toLowerCase().includes(c.name.toLowerCase().split(' ')[0])),
      ).length,
    }))
  }, [categories, filteredOrders])

  const updateGoals = useCallback((patch) => {
    const next = { ...goals, ...patch }
    setGoalsState(next)
    saveGoals(next)
  }, [goals])

  const exportReport = useCallback(
    (reportType, filename) => {
      const rows = generateReport(reportType, {
        orders: filteredOrders,
        products,
        users,
        kpis,
      })
      exportReportCsv(rows, filename || reportType)
    },
    [filteredOrders, products, users, kpis],
  )

  const persistReport = useCallback((report) => {
    const saved = saveReport(report)
    setSavedReports(getSavedReports())
    return saved
  }, [])

  const removeReport = useCallback((id) => {
    deleteSavedReport(id)
    setSavedReports(getSavedReports())
  }, [])

  return {
    loading,
    error,
    refreshing,
    range,
    setRange,
    customRange,
    setCustomRange,
    compareMode,
    setCompareMode,
    revenuePeriod,
    setRevenuePeriod,
    chartMode,
    setChartMode,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    kpis,
    growth,
    goals,
    updateGoals,
    savedReports,
    persistReport,
    removeReport,
    revenueSeries,
    ordersTrend,
    pieData,
    productAnalytics,
    customerAnalytics,
    paymentAnalytics,
    shippingAnalytics,
    inventoryAnalytics,
    marketingAnalytics,
    realtime,
    topProducts,
    categoryBar,
    filteredOrders,
    orders,
    products,
    categories,
    refresh,
    exportReport,
    lowStock: dashboard?.lowStockProducts || [],
  }
}
