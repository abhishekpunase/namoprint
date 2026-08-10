/** Mirrors backend ORDER_STATUSES — do not change without API update. */
import {
  getCustomizationPreviewUrl,
  getCustomizationSummaryLines,
  getCustomizationSummaryText,
} from './customizationDisplay'

export {
  getCustomizationPreviewUrl as getOrderItemDesignPreviewUrl,
  getCustomizationSummaryLines as getOrderItemCustomizationLines,
  getCustomizationSummaryText,
}

export const ORDER_STATUSES = [
  'Pending Payment',
  'Paid',
  'Processing',
  'Print Ready',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Refunded',
]

export const PAYMENT_STATUSES = ['Pending', 'Authorized', 'Paid', 'Failed', 'Refunded']

export function getItemsCount(order) {
  return (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
}

export function getCustomerInitials(order) {
  const name = order.customer?.name || 'Guest'
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getOrderStatusTone(status = '') {
  const value = status.toLowerCase()
  if (value.includes('cancel')) return 'danger'
  if (value.includes('refund')) return 'warning'
  if (value.includes('deliver') || value === 'paid') return 'success'
  if (value.includes('ship') || value.includes('process') || value.includes('print')) return 'info'
  if (value.includes('pending')) return 'warning'
  return 'neutral'
}

export function getPaymentStatusTone(status = '') {
  const value = status.toLowerCase()
  if (value === 'paid') return 'success'
  if (value === 'failed') return 'danger'
  if (value === 'refunded') return 'warning'
  if (value === 'authorized') return 'info'
  return 'neutral'
}

export function getShippingStatus(order) {
  if (order.status === 'Delivered' || order.shipment?.deliveredAt) {
    return { label: 'Delivered', tone: 'success' }
  }
  if (order.status === 'Shipped' || order.shipment?.shippedAt) {
    return { label: order.shipment?.trackingUrl ? 'In Transit' : 'Shipped', tone: 'info' }
  }
  if (order.status === 'Print Ready') return { label: 'Packed', tone: 'info' }
  if (order.shipment?.awbCode || order.shipment?.trackingUrl) {
    return { label: 'Label Generated', tone: 'info' }
  }
  if (order.status === 'Cancelled' || order.status === 'Refunded') {
    return { label: 'Returned', tone: 'warning' }
  }
  return { label: 'Not Packed', tone: 'neutral' }
}

export function formatAddress(address) {
  if (!address) return '—'
  return [
    address.fullName,
    address.line1,
    address.line2,
    [address.city, address.state, address.pincode].filter(Boolean).join(', '),
    address.country,
    address.phone,
  ]
    .filter(Boolean)
    .join('\n')
}

export function formatAddressInline(address) {
  if (!address) return '—'
  return [address.line1, address.city, address.state, address.pincode].filter(Boolean).join(', ')
}

export function buildOrderTimeline(order) {
  const events = []

  if (order.createdAt) {
    events.push({
      id: 'created',
      type: 'order',
      title: 'Order created',
      description: `Order ${order.orderNo} placed`,
      timestamp: order.createdAt,
      user: order.customer?.name || 'Customer',
    })
  }

  if (order.payment?.paidAt || order.payment?.status === 'Paid') {
    events.push({
      id: 'payment',
      type: 'payment',
      title: 'Payment received',
      description: `${order.payment?.provider || 'Gateway'} · ${order.payment?.status}`,
      timestamp: order.payment?.paidAt || order.updatedAt,
      user: 'System',
    })
  }

  for (const entry of order.statusHistory || []) {
    events.push({
      id: `${entry.status}-${entry.changedAt}`,
      type: 'status',
      title: entry.status,
      description: entry.note || 'Status updated',
      timestamp: entry.changedAt,
      user: 'Admin',
    })
  }

  if (order.shipment?.shippedAt) {
    events.push({
      id: 'shipped',
      type: 'shipping',
      title: 'Shipped',
      description: order.shipment.courierName || order.shipment.provider || 'Courier assigned',
      timestamp: order.shipment.shippedAt,
      user: 'Fulfillment',
    })
  }

  if (order.shipment?.deliveredAt) {
    events.push({
      id: 'delivered',
      type: 'shipping',
      title: 'Delivered',
      description: 'Package delivered to customer',
      timestamp: order.shipment.deliveredAt,
      user: 'Courier',
    })
  }

  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  return events
}

export function computeOrderAnalytics(orders = []) {
  const paid = orders.filter((o) => o.payment?.status === 'Paid')
  const revenue = paid.reduce((sum, o) => sum + (o.totals?.total || 0), 0)
  const refunded = orders.filter((o) => o.status === 'Refunded' || o.payment?.status === 'Refunded')
  const cancelled = orders.filter((o) => o.status === 'Cancelled' || o.status === 'Refunded')
  const delivered = orders.filter((o) => o.status === 'Delivered')
  const pending = orders.filter(
    (o) => o.status === 'Pending Payment' || o.payment?.status === 'Pending',
  )
  const inProgress = orders.filter((o) =>
    ['Processing', 'Print Ready', 'Shipped', 'Paid'].includes(o.status),
  )

  return {
    totalOrders: orders.length,
    revenue,
    averageOrderValue: paid.length ? revenue / paid.length : 0,
    refundRate: orders.length ? (refunded.length / orders.length) * 100 : 0,
    cancelledOrders: cancelled.length,
    deliveredOrders: delivered.length,
    pendingOrders: pending.length,
    inProgressOrders: inProgress.length,
  }
}

export function getProductPreview(order) {
  const items = order.items || []
  if (!items.length) return '—'
  const first = items[0].title || 'Product'
  if (items.length === 1) return first
  return `${first} +${items.length - 1} more`
}

export function matchesOrderSearch(order, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    order.orderNo,
    order._id,
    order.customer?.name,
    order.customer?.email,
    order.customer?.phone,
    order.couponCode,
    order.payment?.razorpayOrderId,
    order.payment?.razorpayPaymentId,
    order.shipment?.awbCode,
    order.shipment?.trackingUrl,
    ...(order.items || []).map((i) => i.title),
    ...(order.items || []).map((i) => i.sku),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function getOrderItemSizeLabel(item) {
  const variant = item?.variantSnapshot || {}
  const c = item?.customization || {}
  const size = c.size || c.options?.size || variant.size
  const material = variant.material
  if (size && material) return `Size: ${size} - ${material}`
  if (size) return `Size: ${size}`
  return ''
}

export function getOrderPaymentMethodLabel(order) {
  const provider = String(order?.payment?.provider || '').toLowerCase()
  if (provider.includes('razorpay')) return 'Razorpay'
  if (order?.payment?.status === 'Paid') return 'Online'
  return 'Cash on Delivery'
}

const formatOrderDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : '—'

export { formatOrderDateTime as formatOrderModalDate }
