import { downloadTextFile } from './userAdminUtils'
import {
  buildDistribution,
  buildRevenueSeries,
  buildTopProducts,
  computeInventoryValue,
  filterOrdersByRange,
  isToday,
  isThisMonth,
} from './dashboardMetrics'
import { computeOrderAnalytics } from './orderAdminUtils'
import { getItemsCount } from './orderAdminUtils'

export const ANALYTICS_GOALS_KEY = 'omgs_analytics_goals'
export const ANALYTICS_SAVED_REPORTS_KEY = 'omgs_analytics_saved_reports'
export const ANALYTICS_SCHEDULED_KEY = 'omgs_analytics_scheduled'

export const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
]

export const REPORT_TYPES = [
  { id: 'sales', label: 'Sales Report' },
  { id: 'orders', label: 'Orders Report' },
  { id: 'customers', label: 'Customers Report' },
  { id: 'inventory', label: 'Inventory Report' },
  { id: 'products', label: 'Products Report' },
  { id: 'coupons', label: 'Coupons Report' },
  { id: 'payments', label: 'Payments Report' },
  { id: 'shipping', label: 'Shipping Report' },
  { id: 'tax', label: 'Tax Report' },
]

const PAID = (o) => o?.payment?.status === 'Paid'

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

export function filterOrdersByRangeExtended(orders, rangeKey, customRange) {
  if (rangeKey === '90d') {
    const start = new Date()
    start.setDate(start.getDate() - 90)
    return (orders || []).filter((o) => new Date(o.createdAt) >= start)
  }
  if (rangeKey === 'lastMonth') {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    return (orders || []).filter((o) => {
      const d = new Date(o.createdAt)
      return d >= start && d <= end
    })
  }
  return filterOrdersByRange(orders, rangeKey, customRange)
}

export function getPreviousPeriodOrders(orders, rangeKey, customRange) {
  const current = filterOrdersByRangeExtended(orders, rangeKey, customRange)
  if (!current.length) return []

  const dates = current.map((o) => new Date(o.createdAt).getTime())
  const min = Math.min(...dates)
  const max = Math.max(...dates)
  const span = max - min || 86400000

  return (orders || []).filter((o) => {
    const t = new Date(o.createdAt).getTime()
    return t >= min - span - 1 && t < min
  })
}

export function computeGrowth(current, previous) {
  if (!previous) return current ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function computeKpis({ orders = [], products = [], users = [], stats = {}, coupons = [] }) {
  const paid = orders.filter(PAID)
  const todayPaid = paid.filter((o) => isToday(o.createdAt))
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayPaid = paid.filter((o) => new Date(o.createdAt).toDateString() === yesterday.toDateString())
  const yearStart = new Date(new Date().getFullYear(), 0, 1)
  const yearlyPaid = paid.filter((o) => new Date(o.createdAt) >= yearStart)

  const sumTotal = (list) => list.reduce((s, o) => s + (o.totals?.total || 0), 0)
  const sumField = (list, field) => list.reduce((s, o) => s + (o.totals?.[field] || 0), 0)

  const totalRevenue = stats.totalRevenue ?? sumTotal(paid)
  const todayRevenue = sumTotal(todayPaid)
  const yesterdayRevenue = sumTotal(yesterdayPaid)
  const monthlyRevenue = stats.monthlyRevenue ?? sumTotal(paid.filter((o) => isThisMonth(o.createdAt)))
  const yearlyRevenue = sumTotal(yearlyPaid)

  const completed = orders.filter((o) => ['Delivered', 'Shipped', 'Paid', 'Processing', 'Print Ready'].includes(o.status))
  const cancelled = orders.filter((o) => o.status === 'Cancelled')
  const refunded = orders.filter((o) => o.status === 'Refunded' || o.payment?.status === 'Refunded')

  const avgItems = paid.length
    ? paid.reduce((s, o) => s + getItemsCount(o), 0) / paid.length
    : 0

  const orderAnalytics = computeOrderAnalytics(orders)

  return {
    totalRevenue,
    todayRevenue,
    yesterdayRevenue,
    monthlyRevenue,
    yearlyRevenue,
    totalOrders: stats.totalOrders ?? orders.length,
    completedOrders: stats.paidOrders ?? completed.length,
    cancelledOrders: cancelled.length,
    refundedOrders: refunded.length,
    averageOrderValue: orderAnalytics.averageOrderValue,
    averageBasketSize: avgItems,
    grossProfit: null,
    netProfit: null,
    taxCollected: sumField(paid, 'tax'),
    shippingRevenue: sumField(paid, 'shipping'),
    discountAmount: sumField(paid, 'discount'),
    pendingOrders: stats.pendingOrders ?? orderAnalytics.pendingOrders,
    totalProducts: stats.totalProducts ?? products.length,
    totalCustomers: stats.totalUsers ?? users.filter((u) => u.role === 'customer').length,
    inventoryValue: computeInventoryValue(products),
    couponCount: coupons.length,
  }
}

export function buildOrdersTrend(orders, period = 'daily') {
  const buckets = new Map()
  orders.forEach((order) => {
    const date = new Date(order.createdAt)
    let key
    if (period === 'daily') key = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    else if (period === 'weekly') {
      const week = Math.ceil(date.getDate() / 7)
      key = `W${week} ${date.toLocaleDateString('en-IN', { month: 'short' })}`
    } else if (period === 'yearly') key = String(date.getFullYear())
    else key = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    buckets.set(key, (buckets.get(key) || 0) + 1)
  })
  const entries = [...buckets.entries()].slice(-12)
  if (!entries.length) return [{ label: '—', value: 0 }]
  return entries.map(([label, value]) => ({ label, value }))
}

export function buildProductAnalytics(products = [], orders = []) {
  const soldMap = new Map()
  orders.filter(PAID).forEach((order) => {
    order.items?.forEach((item) => {
      const key = item.title || 'Product'
      const prev = soldMap.get(key) || { qty: 0, revenue: 0, sku: item.sku }
      soldMap.set(key, {
        qty: prev.qty + (item.quantity || 0),
        revenue: prev.revenue + (item.unitPrice || 0) * (item.quantity || 0),
        sku: item.sku || prev.sku,
      })
    })
  })

  const ranked = [...soldMap.entries()]
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)

  const topSelling = ranked.slice(0, 8)
  const leastSelling = [...ranked].reverse().slice(0, 5)
  const highestRevenue = [...ranked].sort((a, b) => b.revenue - a.revenue).slice(0, 8)

  const lowStock = []
  const outOfStock = []
  products.forEach((p) => {
    ;(p.variants || []).forEach((v) => {
      if ((v.stock || 0) <= 0) outOfStock.push({ name: p.title, sku: v.sku, stock: 0 })
      else if ((v.stock || 0) <= 5) lowStock.push({ name: p.title, sku: v.sku, stock: v.stock })
    })
  })

  const categoryMap = new Map()
  products.forEach((p) => {
    const cat = p.category?.name || p.productType || 'Other'
    const stock = (p.variants || []).reduce((s, v) => s + (v.stock || 0), 0)
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + stock)
  })

  return {
    topSelling,
    leastSelling,
    highestRevenue,
    lowStock: lowStock.slice(0, 10),
    outOfStock: outOfStock.slice(0, 10),
    categoryPerformance: [...categoryMap.entries()].map(([label, value]) => ({ label, value })).slice(0, 8),
    mostViewed: [],
  }
}

export function buildCustomerAnalytics(users = [], orders = []) {
  const customers = users.filter((u) => u.role === 'customer')
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const newCustomers = customers.filter((u) => new Date(u.createdAt) >= monthStart)

  const orderCountByEmail = new Map()
  const revenueByEmail = new Map()
  orders.filter(PAID).forEach((o) => {
    const key = o.customer?.email || o.customer?.name || 'guest'
    orderCountByEmail.set(key, (orderCountByEmail.get(key) || 0) + 1)
    revenueByEmail.set(key, (revenueByEmail.get(key) || 0) + (o.totals?.total || 0))
  })

  const returning = [...orderCountByEmail.values()].filter((c) => c > 1).length
  const topBuyers = [...revenueByEmail.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, revenue]) => ({ name, revenue, orders: orderCountByEmail.get(name) || 0 }))

  const repeatRate = customers.length
    ? (returning / customers.length) * 100
    : 0

  return {
    total: customers.length,
    newCustomers: newCustomers.length,
    returningCustomers: returning,
    activeCustomers: customers.filter((u) => u.isActive !== false).length,
    inactiveCustomers: customers.filter((u) => u.isActive === false).length,
    topBuyers,
    repeatPurchaseRate: repeatRate,
    averageLtv: customers.length
      ? [...revenueByEmail.values()].reduce((s, v) => s + v, 0) / customers.length
      : 0,
  }
}

export function buildPaymentAnalytics(orders = []) {
  const paid = orders.filter(PAID)
  const failed = orders.filter((o) => o.payment?.status === 'Failed')
  const refunded = orders.filter((o) => o.payment?.status === 'Refunded' || o.status === 'Refunded')
  const gatewayMap = new Map()

  orders.forEach((o) => {
    const gw = o.payment?.provider || 'razorpay'
    const prev = gatewayMap.get(gw) || { count: 0, revenue: 0, failed: 0 }
    gatewayMap.set(gw, {
      count: prev.count + 1,
      revenue: prev.revenue + (PAID(o) ? o.totals?.total || 0 : 0),
      failed: prev.failed + (o.payment?.status === 'Failed' ? 1 : 0),
    })
  })

  const codOrders = orders.filter((o) => o.payment?.provider === 'cod' || o.payment?.method === 'cod').length
  const onlineOrders = orders.length - codOrders

  return {
    successful: paid.length,
    failed: failed.length,
    refunded: refunded.length,
    codOrders,
    onlineOrders,
    byGateway: [...gatewayMap.entries()].map(([label, data]) => ({ label, ...data })),
    revenueByGateway: [...gatewayMap.entries()].map(([label, data]) => ({
      label,
      value: data.revenue,
      color: label === 'razorpay' ? '#6366f1' : '#06b6d4',
    })),
  }
}

export function buildShippingAnalytics(orders = []) {
  const shipped = orders.filter((o) => o.shipment?.shippedAt || o.status === 'Shipped' || o.status === 'Delivered')
  const delivered = orders.filter((o) => o.status === 'Delivered' || o.shipment?.deliveredAt)
  const courierMap = new Map()

  orders.forEach((o) => {
    const courier = o.shipment?.courierName || o.shipment?.provider || 'Unassigned'
    courierMap.set(courier, (courierMap.get(courier) || 0) + 1)
  })

  const deliveryTimes = delivered
    .filter((o) => o.shipment?.shippedAt && o.shipment?.deliveredAt)
    .map((o) => (new Date(o.shipment.deliveredAt) - new Date(o.shipment.shippedAt)) / 86400000)

  const avgDeliveryDays = deliveryTimes.length
    ? deliveryTimes.reduce((s, d) => s + d, 0) / deliveryTimes.length
    : null

  return {
    totalShipped: shipped.length,
    delivered: delivered.length,
    deliverySuccessRate: shipped.length ? (delivered.length / shipped.length) * 100 : 0,
    averageDeliveryDays: avgDeliveryDays,
    shippingCost: orders.reduce((s, o) => s + (o.totals?.shipping || 0), 0),
    byCourier: [...courierMap.entries()].map(([label, value]) => ({ label, value })).slice(0, 8),
    lateDeliveries: null,
    returnedShipments: orders.filter((o) => o.status === 'Refunded').length,
  }
}

export function buildInventoryAnalytics(products = [], orders = []) {
  const value = computeInventoryValue(products)
  const soldSkus = new Map()
  orders.filter(PAID).forEach((o) => {
    o.items?.forEach((item) => {
      const key = item.sku || item.title
      soldSkus.set(key, (soldSkus.get(key) || 0) + (item.quantity || 0))
    })
  })

  const rows = []
  products.forEach((p) => {
    ;(p.variants || []).forEach((v) => {
      rows.push({
        sku: v.sku,
        name: p.title,
        stock: v.stock || 0,
        sold: soldSkus.get(v.sku) || 0,
      })
    })
  })

  const fastMoving = [...rows].sort((a, b) => b.sold - a.sold).slice(0, 8)
  const slowMoving = [...rows].filter((r) => r.stock > 0).sort((a, b) => a.sold - b.sold).slice(0, 8)
  const deadStock = rows.filter((r) => r.stock > 0 && r.sold === 0).slice(0, 8)

  return {
    inventoryValue: value,
    fastMoving,
    slowMoving,
    deadStock,
    stockTurnover: null,
    warehousePerformance: [],
  }
}

export function buildMarketingAnalytics(orders = [], coupons = []) {
  const withCoupon = orders.filter((o) => o.couponCode)
  const couponRevenue = withCoupon.filter(PAID).reduce((s, o) => s + (o.totals?.total || 0), 0)
  const discountImpact = withCoupon.filter(PAID).reduce((s, o) => s + (o.totals?.discount || 0), 0)

  const usageMap = new Map()
  withCoupon.forEach((o) => {
    const code = o.couponCode
    usageMap.set(code, (usageMap.get(code) || 0) + 1)
  })

  return {
    couponUsage: withCoupon.length,
    campaignRevenue: couponRevenue,
    discountImpact,
    couponBreakdown: [...usageMap.entries()].map(([label, value]) => ({ label, value })),
    referralOrders: 0,
    organicOrders: orders.length - withCoupon.length,
    paidOrders: orders.filter(PAID).length,
  }
}

export function buildRealTimeSnapshot(orders = [], users = []) {
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)
  const recentPayments = orders
    .filter(PAID)
    .sort((a, b) => new Date(b.payment?.paidAt || b.updatedAt) - new Date(a.payment?.paidAt || a.updatedAt))
    .slice(0, 6)
  const recentUsers = users
    .filter((u) => u.role === 'customer')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return {
    liveOrders: recentOrders,
    liveRevenue: recentOrders.filter(PAID).reduce((s, o) => s + (o.totals?.total || 0), 0),
    activeUsers: users.filter((u) => u.isActive !== false).length,
    recentPayments,
    recentRegistrations: recentUsers,
  }
}

export function generateReport(reportType, data) {
  const { orders = [], products = [], users = [], kpis = {} } = data
  switch (reportType) {
    case 'sales':
      return orders.filter(PAID).map((o) => ({
        orderNo: o.orderNo,
        date: o.createdAt,
        customer: o.customer?.name,
        total: o.totals?.total,
        discount: o.totals?.discount,
        tax: o.totals?.tax,
      }))
    case 'orders':
      return orders.map((o) => ({
        orderNo: o.orderNo,
        status: o.status,
        payment: o.payment?.status,
        total: o.totals?.total,
        createdAt: o.createdAt,
      }))
    case 'customers':
      return users.filter((u) => u.role === 'customer').map((u) => ({
        name: u.name,
        email: u.email,
        phone: u.phone,
        registered: u.createdAt,
      }))
    case 'inventory':
      return products.flatMap((p) =>
        (p.variants || []).map((v) => ({
          product: p.title,
          sku: v.sku,
          stock: v.stock,
          price: v.price,
        })),
      )
    case 'products':
      return buildProductAnalytics(products, orders).topSelling
    case 'coupons':
      return buildMarketingAnalytics(orders).couponBreakdown
    case 'payments':
      return buildPaymentAnalytics(orders).byGateway
    case 'shipping':
      return buildShippingAnalytics(orders).byCourier
    case 'tax':
      return orders.filter(PAID).map((o) => ({
        orderNo: o.orderNo,
        tax: o.totals?.tax,
        total: o.totals?.total,
        date: o.createdAt,
      }))
    default:
      return []
  }
}

export function exportReportCsv(rows, filename) {
  if (!rows?.length) return
  const keys = Object.keys(rows[0])
  const header = keys.join(',')
  const body = rows.map((row) =>
    keys.map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(','),
  )
  downloadTextFile(`${filename}.csv`, [header, ...body].join('\n'))
}

export function getGoals() {
  return readJson(ANALYTICS_GOALS_KEY, {
    monthlyRevenue: 500000,
    ordersTarget: 200,
    customerTarget: 100,
    salesTarget: 500000,
  })
}

export function saveGoals(goals) {
  writeJson(ANALYTICS_GOALS_KEY, goals)
}

export function getSavedReports() {
  return readJson(ANALYTICS_SAVED_REPORTS_KEY, [])
}

export function saveReport(report) {
  const reports = getSavedReports()
  const entry = { ...report, id: report.id || `rpt-${Date.now()}`, savedAt: new Date().toISOString() }
  const idx = reports.findIndex((r) => r.id === entry.id)
  if (idx >= 0) reports[idx] = entry
  else reports.unshift(entry)
  writeJson(ANALYTICS_SAVED_REPORTS_KEY, reports.slice(0, 50))
  return entry
}

export function deleteSavedReport(id) {
  writeJson(
    ANALYTICS_SAVED_REPORTS_KEY,
    getSavedReports().filter((r) => r.id !== id),
  )
}
