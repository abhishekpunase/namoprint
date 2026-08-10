import { computeInventoryValue } from './dashboardMetrics'
import { getMinPrice, getTotalStock } from './productFormUtils'
import { downloadTextFile } from './userAdminUtils'

export const LOW_STOCK_THRESHOLD = 5
export const INVENTORY_META_KEY = 'omgs_inventory_meta'
export const STOCK_HISTORY_KEY = 'omgs_stock_history'
export const WAREHOUSES_KEY = 'omgs_inventory_warehouses'
export const SUPPLIERS_KEY = 'omgs_inventory_suppliers'
export const INCOMING_STOCK_KEY = 'omgs_incoming_stock'

export const DEFAULT_WAREHOUSES = [
  { id: 'main', name: 'Main Warehouse', location: 'Default', manager: '—', capacity: 10000, isDefault: true },
]

export const DEFAULT_COLUMNS = [
  'image',
  'name',
  'sku',
  'barcode',
  'category',
  'warehouse',
  'current',
  'reserved',
  'available',
  'incoming',
  'min',
  'max',
  'status',
  'updated',
  'actions',
]

export const STOCK_STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'overstock', label: 'Overstock' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'backordered', label: 'Backordered' },
  { value: 'discontinued', label: 'Discontinued' },
]

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

export function getVariantMeta(productId, variantId) {
  const all = readJson(INVENTORY_META_KEY, {})
  const key = `${productId}:${variantId}`
  return all[key] || { minStock: LOW_STOCK_THRESHOLD, maxStock: 500, barcode: '', warehouseId: 'main' }
}

export function setVariantMeta(productId, variantId, patch) {
  const all = readJson(INVENTORY_META_KEY, {})
  const key = `${productId}:${variantId}`
  all[key] = { ...(all[key] || {}), ...patch }
  writeJson(INVENTORY_META_KEY, all)
  return all[key]
}

export function getWarehouses() {
  const stored = readJson(WAREHOUSES_KEY, null)
  return stored?.length ? stored : DEFAULT_WAREHOUSES
}

export function getIncomingStock(productId, variantId) {
  const all = readJson(INCOMING_STOCK_KEY, {})
  return all[`${productId}:${variantId}`] || 0
}

export function setIncomingStock(productId, variantId, qty) {
  const all = readJson(INCOMING_STOCK_KEY, {})
  all[`${productId}:${variantId}`] = qty
  writeJson(INCOMING_STOCK_KEY, all)
}

export function appendStockHistory(entry) {
  const history = readJson(STOCK_HISTORY_KEY, [])
  history.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  })
  writeJson(STOCK_HISTORY_KEY, history.slice(0, 1000))
}

export function getStockHistory(filter = {}) {
  let history = readJson(STOCK_HISTORY_KEY, [])
  if (filter.productId) history = history.filter((h) => h.productId === filter.productId)
  if (filter.variantId) history = history.filter((h) => h.variantId === filter.variantId)
  return history
}

export function computeReservedStock(orders = [], productId, sku) {
  const activeStatuses = ['Pending Payment', 'Paid', 'Processing', 'Print Ready']
  const pid = String(productId)
  return orders.reduce((sum, order) => {
    if (!activeStatuses.includes(order.status)) return sum
    return (
      sum +
      (order.items || []).reduce((itemSum, item) => {
        const matchProduct = String(item.product?._id || item.product) === pid
        const matchSku = !sku || item.sku === sku
        return matchProduct && matchSku ? itemSum + (item.quantity || 0) : itemSum
      }, 0)
    )
  }, 0)
}

export function getStockStatus(current, reserved, minStock, maxStock, isActive = true) {
  if (!isActive) return { key: 'discontinued', label: 'Discontinued', tone: 'neutral' }
  const available = Math.max(0, current - reserved)
  if (current <= 0) return { key: 'out_of_stock', label: 'Out of Stock', tone: 'danger' }
  if (available <= 0 && reserved > 0) return { key: 'reserved', label: 'Reserved', tone: 'warning' }
  if (current <= minStock) return { key: 'low_stock', label: 'Low Stock', tone: 'warning' }
  if (maxStock && current > maxStock) return { key: 'overstock', label: 'Overstock', tone: 'info' }
  return { key: 'in_stock', label: 'In Stock', tone: 'success' }
}

export function flattenProductInventory(product, orders = [], warehouses = DEFAULT_WAREHOUSES) {
  const productId = product._id || product.id
  const variants = product.variants?.length ? product.variants : [{ sku: '—', size: '—', stock: 0, _id: 'default' }]

  return variants.map((variant) => {
    const variantId = variant._id || variant.id || variant.sku
    const meta = getVariantMeta(productId, variantId)
    const warehouse = warehouses.find((w) => w.id === meta.warehouseId) || warehouses[0]
    const current = variant.stock || 0
    const reserved = computeReservedStock(orders, productId, variant.sku)
    const incoming = getIncomingStock(productId, variantId)
    const available = Math.max(0, current - reserved)
    const status = getStockStatus(current, reserved, meta.minStock, meta.maxStock, variant.isActive !== false && product.isActive !== false)

    return {
      id: `${productId}:${variantId}`,
      productId,
      variantId,
      productName: product.title,
      slug: product.slug,
      sku: variant.sku || '—',
      barcode: meta.barcode || product.barcode || '—',
      category: product.category?.name || product.productType || '—',
      brand: product.attributes?.brand?.[0] || '—',
      warehouse: warehouse?.name || 'Main Warehouse',
      warehouseId: warehouse?.id || 'main',
      currentStock: current,
      reservedStock: reserved,
      availableStock: available,
      incomingStock: incoming,
      minStock: meta.minStock,
      maxStock: meta.maxStock,
      status,
      price: variant.price || getMinPrice(product),
      size: variant.size,
      material: variant.material,
      frameType: variant.frameType,
      image: product.thumbnail || product.images?.[0] || product.mockup?.frameImage || '',
      lastUpdated: product.updatedAt || product.createdAt,
      isDemo: product._catalogSource === 'demo',
      product,
      variant,
    }
  })
}

export function flattenAllInventory(products = [], orders = []) {
  const warehouses = getWarehouses()
  return products.flatMap((p) => flattenProductInventory(p, orders, warehouses))
}

export function computeInventoryDashboard(products = [], orders = [], rows = []) {
  const items = rows.length ? rows : flattenAllInventory(products, orders)
  const totalProducts = products.length
  const totalInventory = items.reduce((sum, r) => sum + r.currentStock, 0)
  const lowStock = items.filter((r) => r.status.key === 'low_stock').length
  const outOfStock = items.filter((r) => r.status.key === 'out_of_stock').length
  const reserved = items.reduce((sum, r) => sum + r.reservedStock, 0)
  const incoming = items.reduce((sum, r) => sum + r.incomingStock, 0)
  const inventoryValue = computeInventoryValue(products)
  const warehouses = getWarehouses()

  const today = new Date().toDateString()
  const todayMovement = getStockHistory().filter(
    (h) => new Date(h.timestamp).toDateString() === today,
  ).length

  return {
    totalProducts,
    totalInventory,
    lowStock,
    outOfStock,
    reserved,
    incoming,
    warehouseCount: warehouses.length,
    inventoryValue,
    todayMovement,
    variantCount: items.length,
  }
}

export function computeInventoryAnalytics(products = [], orders = [], rows = []) {
  const items = rows.length ? rows : flattenAllInventory(products, orders)
  const paidOrders = orders.filter((o) => o.payment?.status === 'Paid')

  const skuSales = {}
  paidOrders.forEach((order) => {
    ;(order.items || []).forEach((item) => {
      const key = item.sku || item.title
      skuSales[key] = (skuSales[key] || 0) + (item.quantity || 0)
    })
  })

  const sorted = Object.entries(skuSales).sort((a, b) => b[1] - a[1])
  const bestSelling = sorted.slice(0, 5).map(([sku, qty]) => ({ sku, qty }))
  const slowMoving = items
    .filter((r) => !skuSales[r.sku] && r.currentStock > 0)
    .slice(0, 5)
    .map((r) => ({ name: r.productName, sku: r.sku, stock: r.currentStock }))
  const deadStock = items.filter((r) => r.currentStock > 0 && !skuSales[r.sku]).length
  const avgInventory = items.length ? items.reduce((s, r) => s + r.currentStock, 0) / items.length : 0

  return {
    inventoryValue: computeInventoryValue(products),
    stockTurnover: paidOrders.length ? (items.reduce((s, r) => s + r.currentStock, 0) / paidOrders.length).toFixed(1) : '—',
    bestSelling,
    slowMoving,
    fastMoving: bestSelling.slice(0, 3),
    deadStock,
    averageInventory: Math.round(avgInventory),
  }
}

export function matchesInventorySearch(row, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [row.productName, row.sku, row.barcode, row.category, row.warehouse, row.brand]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q))
}

export function matchesInventoryFilters(row, filters) {
  if (filters.stockStatus) {
    if (filters.stockStatus === 'backordered' && row.status.key !== 'out_of_stock') return false
    else if (filters.stockStatus !== 'backordered' && row.status.key !== filters.stockStatus) return false
  }
  if (filters.warehouse && row.warehouseId !== filters.warehouse) return false
  if (filters.category && row.category !== filters.category) return false
  if (filters.brand && row.brand !== filters.brand) return false
  if (filters.reserved === 'yes' && row.reservedStock <= 0) return false
  if (filters.reserved === 'no' && row.reservedStock > 0) return false
  return true
}

export function exportInventoryCsv(rows) {
  const header = [
    'Product',
    'SKU',
    'Category',
    'Warehouse',
    'Current',
    'Reserved',
    'Available',
    'Incoming',
    'Min',
    'Max',
    'Status',
  ]
  const lines = rows.map((r) =>
    [
      r.productName,
      r.sku,
      r.category,
      r.warehouse,
      r.currentStock,
      r.reservedStock,
      r.availableStock,
      r.incomingStock,
      r.minStock,
      r.maxStock,
      r.status.label,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

export function downloadInventoryExport(rows, format = 'csv') {
  const content = exportInventoryCsv(rows)
  downloadTextFile(`inventory-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'csv' : 'csv'}`, content)
}

export function printInventoryTable(rows) {
  const html = `<html><head><title>Inventory</title><style>
    body{font-family:Arial,sans-serif;padding:24px} table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:8px;font-size:12px;text-align:left} th{background:#f5f5f5}
  </style></head><body><h1>Inventory Report</h1><table><thead><tr>
    <th>Product</th><th>SKU</th><th>Stock</th><th>Reserved</th><th>Available</th><th>Status</th>
  </tr></thead><tbody>${rows
    .map(
      (r) =>
        `<tr><td>${r.productName}</td><td>${r.sku}</td><td>${r.currentStock}</td><td>${r.reservedStock}</td><td>${r.availableStock}</td><td>${r.status.label}</td></tr>`,
    )
    .join('')}</tbody></table></body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.print()
}
