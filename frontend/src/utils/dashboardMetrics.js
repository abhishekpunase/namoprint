const PAID = (order) => order?.payment?.status === 'Paid'

export const isToday = (date) => {
  const d = new Date(date)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

export const isThisMonth = (date) => {
  const d = new Date(date)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export const startOfDay = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function filterOrdersByRange(orders, rangeKey, customRange) {
  if (!orders?.length) return []
  const now = new Date()
  const start = new Date(now)

  switch (rangeKey) {
    case 'today':
      return orders.filter((o) => isToday(o.createdAt))
    case 'yesterday':
      start.setDate(start.getDate() - 1)
      return orders.filter((o) => startOfDay(o.createdAt).getTime() === startOfDay(start).getTime())
    case '7d':
      start.setDate(start.getDate() - 7)
      return orders.filter((o) => new Date(o.createdAt) >= start)
    case '30d':
      start.setDate(start.getDate() - 30)
      return orders.filter((o) => new Date(o.createdAt) >= start)
    case 'month':
      return orders.filter((o) => isThisMonth(o.createdAt))
    case 'year':
      return orders.filter((o) => new Date(o.createdAt).getFullYear() === now.getFullYear())
    case 'custom':
      if (!customRange?.from || !customRange?.to) return orders
      return orders.filter((o) => {
        const created = new Date(o.createdAt)
        return created >= new Date(customRange.from) && created <= new Date(customRange.to)
      })
    default:
      return orders
  }
}

export function computeOrderMetrics(orders = [], stats = {}) {
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length
  const completedOrders = orders.filter((o) => ['Paid', 'Delivered', 'Shipped', 'Processing', 'Print Ready'].includes(o.status)).length
  const todaySales = orders
    .filter((o) => PAID(o) && isToday(o.createdAt))
    .reduce((sum, o) => sum + (o.totals?.total || 0), 0)

  return {
    cancelledOrders,
    completedOrders: stats.paidOrders ?? completedOrders,
    todaySales,
  }
}

export function computeInventoryValue(products = []) {
  return products.reduce((total, product) => {
    const productValue = (product.variants || []).reduce(
      (sum, variant) => sum + (variant.price || 0) * (variant.stock || 0),
      0,
    )
    return total + productValue
  }, 0)
}

export function countNewUsers(users = []) {
  return users.filter((user) => user.role === 'customer' && isThisMonth(user.createdAt)).length
}

export function buildRevenueSeries(orders = [], period = 'monthly') {
  const paid = orders.filter(PAID)
  const buckets = new Map()

  paid.forEach((order) => {
    const date = new Date(order.createdAt)
    let key
    if (period === 'daily') key = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    else if (period === 'weekly') {
      const week = Math.ceil(date.getDate() / 7)
      key = `W${week} ${date.toLocaleDateString('en-IN', { month: 'short' })}`
    } else if (period === 'yearly') key = String(date.getFullYear())
    else key = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })

    buckets.set(key, (buckets.get(key) || 0) + (order.totals?.total || 0))
  })

  const entries = [...buckets.entries()].slice(-8)
  if (!entries.length) {
    return [
      { label: '—', value: 0 },
      { label: '—', value: 0 },
      { label: '—', value: 0 },
    ]
  }

  return entries.map(([label, value]) => ({ label, value }))
}

export function buildDistribution(orders = [], mode = 'orders') {
  const map = new Map()

  if (mode === 'categories' || mode === 'products') {
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const key = mode === 'products' ? item.title || 'Product' : item.title?.split(' ')[0] || 'Other'
        const increment = mode === 'orders' ? 1 : item.quantity || 1
        map.set(key, (map.get(key) || 0) + increment)
      })
    })
  } else if (mode === 'revenue') {
    orders.filter(PAID).forEach((order) => {
      order.items?.forEach((item) => {
        const key = item.title || 'Product'
        map.set(key, (map.get(key) || 0) + item.unitPrice * item.quantity)
      })
    })
  } else {
    orders.forEach((order) => {
      const key = order.status || 'Unknown'
      map.set(key, (map.get(key) || 0) + 1)
    })
  }

  const palette = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)

  if (!entries.length) {
    return [{ label: 'No data', value: 1, color: '#94a3b8' }]
  }

  return entries.map(([label, value], index) => ({
    label,
    value,
    color: palette[index % palette.length],
  }))
}

export function buildCategoryBarData(orders = [], categories = []) {
  if (categories.length) {
    return categories.slice(0, 6).map((category) => ({
      label: category.name,
      value: orders.filter((order) =>
        order.items?.some((item) => String(item.title || '').toLowerCase().includes(category.name.toLowerCase().split(' ')[0])),
      ).length,
    }))
  }

  return buildRevenueSeries(orders, 'monthly').map((item) => ({
    label: item.label,
    value: Math.round(item.value / 1000) || 0,
  }))
}

export function buildTopProducts(products = [], orders = []) {
  const soldMap = new Map()
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const key = item.title || 'Product'
      soldMap.set(key, {
        sold: (soldMap.get(key)?.sold || 0) + (item.quantity || 0),
        revenue: (soldMap.get(key)?.revenue || 0) + item.unitPrice * item.quantity,
      })
    })
  })

  return products.slice(0, 6).map((product) => {
    const stats = soldMap.get(product.title) || { sold: 0, revenue: 0 }
    return {
      id: product._id,
      name: product.title,
      slug: product.slug,
      category: product.category?.name || product.productType || '—',
      image: product.images?.[0] || '',
      sold: stats.sold,
      revenue: stats.revenue,
    }
  })
}

export function buildActivityFeed(orders = [], users = []) {
  const events = []

  orders.slice(0, 8).forEach((order) => {
    events.push({
      id: `order-${order._id}`,
      type: 'order',
      title: 'Order created',
      description: `${order.orderNo} · ${order.customer?.name || 'Customer'}`,
      timestamp: order.createdAt,
      user: order.customer?.name || 'Customer',
    })
    if (PAID(order)) {
      events.push({
        id: `payment-${order._id}`,
        type: 'payment',
        title: 'Payment received',
        description: `${order.orderNo} · ${order.totals?.total || 0}`,
        timestamp: order.updatedAt || order.createdAt,
        user: order.customer?.name || 'Customer',
      })
    }
  })

  users.slice(0, 4).forEach((user) => {
    events.push({
      id: `user-${user._id}`,
      type: 'customer',
      title: 'Customer registered',
      description: user.email,
      timestamp: user.createdAt,
      user: user.name,
    })
  })

  return events
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
}

export function flattenLowStock(products = []) {
  return products.flatMap((product) =>
    (product.variants || [])
      .filter((variant) => variant.stock <= 5)
      .map((variant) => ({
        id: `${product._id}-${variant._id}`,
        productId: product._id,
        name: product.title,
        sku: variant.sku,
        size: variant.size,
        stock: variant.stock,
        minimum: 5,
        image: product.images?.[0] || '',
      })),
  )
}
