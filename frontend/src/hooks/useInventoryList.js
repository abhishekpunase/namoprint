import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { loadAdminProductCatalog, isCatalogDemoProduct, findAdminProductById } from '../utils/adminProductCatalog'
import { productToForm, buildProductPayload } from '../utils/productFormUtils'
import {
  DEFAULT_COLUMNS,
  appendStockHistory,
  computeInventoryAnalytics,
  computeInventoryDashboard,
  downloadInventoryExport,
  flattenAllInventory,
  flattenProductInventory,
  getStockHistory,
  getWarehouses,
  matchesInventoryFilters,
  matchesInventorySearch,
  printInventoryTable,
  setIncomingStock,
  setVariantMeta,
} from '../utils/inventoryAdminUtils'

export function useInventoryList() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [sortKey, setSortKey] = useState('productName')
  const [sortDir, setSortDir] = useState('asc')
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS)
  const [density, setDensity] = useState('comfortable')
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({
    stockStatus: '',
    warehouse: '',
    category: '',
    brand: '',
    reserved: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [catalog, ordersPayload] = await Promise.all([loadAdminProductCatalog(), api.adminOrders()])
      setProducts(catalog)
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

  const rows = useMemo(() => flattenAllInventory(products, orders), [products, orders])

  const filtered = useMemo(() => {
    let list = [...rows]
    if (search.trim()) list = list.filter((r) => matchesInventorySearch(r, search))
    list = list.filter((r) => matchesInventoryFilters(r, filters))

    list.sort((a, b) => {
      let left
      let right
      switch (sortKey) {
        case 'sku':
          left = a.sku
          right = b.sku
          break
        case 'current':
          left = a.currentStock
          right = b.currentStock
          break
        case 'available':
          left = a.availableStock
          right = b.availableStock
          break
        case 'status':
          left = a.status.label
          right = b.status.label
          break
        case 'updated':
          left = new Date(a.lastUpdated || 0).getTime()
          right = new Date(b.lastUpdated || 0).getTime()
          break
        default:
          left = a.productName || ''
          right = b.productName || ''
      }
      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [rows, search, filters, sortKey, sortDir])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const dashboard = useMemo(() => computeInventoryDashboard(products, orders, rows), [products, orders, rows])
  const analytics = useMemo(() => computeInventoryAnalytics(products, orders, rows), [products, orders, rows])

  const filterOptions = useMemo(() => {
    const categories = [...new Set(rows.map((r) => r.category).filter(Boolean))].sort()
    const brands = [...new Set(rows.map((r) => r.brand).filter((b) => b && b !== '—'))].sort()
    return { categories, brands, warehouses: getWarehouses() }
  }, [rows])

  const lowStockRows = useMemo(() => rows.filter((r) => r.status.key === 'low_stock'), [rows])
  const outOfStockRows = useMemo(() => rows.filter((r) => r.status.key === 'out_of_stock'), [rows])

  const toggleSelect = useCallback((id) => {
    setSelected((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }, [])

  const toggleSelectAll = useCallback(() => {
    const ids = paginated.map((r) => r.id)
    setSelected((c) => (c.length === ids.length ? [] : ids))
  }, [paginated])

  const getExportRows = useCallback(() => {
    if (selected.length) return filtered.filter((r) => selected.includes(r.id))
    return filtered
  }, [filtered, selected])

  const adjustRowStock = useCallback(
    async ({ row, delta, reason, notes, newStock }) => {
      if (!row || row.isDemo) throw new Error('Cannot update demo product stock')
      const found = products.find((p) => p._id === row.productId)
      if (!found) throw new Error('Product not found')

      const categoriesPayload = await api.adminCategories()
      const categories = categoriesPayload.categories || []
      const form = productToForm(found)
      const idx = form.variants.findIndex((v) => v.sku === row.sku)
      if (idx < 0) throw new Error('Variant not found')

      const prev = Number(form.variants[idx].stock || 0)
      const next = newStock !== undefined ? Math.max(0, newStock) : Math.max(0, prev + delta)
      form.variants[idx].stock = String(next)
      const payload = buildProductPayload(form, categories)
      await api.adminUpdateProduct(row.productId, payload)

      appendStockHistory({
        productId: row.productId,
        variantId: row.variantId,
        productName: row.productName,
        sku: row.sku,
        type: newStock !== undefined ? 'correction' : delta >= 0 ? 'increase' : 'decrease',
        reason,
        notes,
        previous: prev,
        change: next - prev,
        newStock: next,
        user: 'Admin',
      })
      await load()
      return next
    },
    [products, load],
  )

  return {
    products,
    orders,
    rows,
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
    density,
    setDensity,
    filters,
    setFilters,
    filtered,
    paginated,
    total: filtered.length,
    dashboard,
    analytics,
    filterOptions,
    lowStockRows,
    outOfStockRows,
    load,
    refresh,
    refreshing,
    toggleSelect,
    toggleSelectAll,
    exportCsv: () => downloadInventoryExport(getExportRows(), 'csv'),
    exportExcel: () => downloadInventoryExport(getExportRows(), 'excel'),
    printList: () => printInventoryTable(getExportRows()),
    adjustRowStock,
  }
}

export function useInventoryDetail(productId) {
  const [product, setProduct] = useState(null)
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setError('')
    try {
      const [catalog, ordersPayload, categoriesPayload] = await Promise.all([
        loadAdminProductCatalog(),
        api.adminOrders(),
        api.adminCategories(),
      ])
      const found = findAdminProductById(productId, catalog)
      if (!found) throw new Error('Product not found')
      setProduct(found)
      setOrders(ordersPayload.orders || [])
      setCategories(categoriesPayload.categories || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  const inventoryRows = useMemo(
    () => (product ? flattenProductInventory(product, orders) : []),
    [product, orders],
  )

  const history = useMemo(() => getStockHistory({ productId }), [productId, product, message])

  const adjustStock = useCallback(
    async ({ variantId, variantIndex, delta, reason, notes, type = 'adjustment' }) => {
      if (!product) return
      if (isCatalogDemoProduct(product)) {
        setError('Demo catalog products must be published to the database before stock updates.')
        return
      }

      setSaving(true)
      setError('')
      setMessage('')
      try {
        const form = productToForm(product)
        const idx =
          variantIndex ??
          form.variants.findIndex((v, i) => {
            const vid = product.variants?.[i]?._id
            return String(vid) === String(variantId) || v.sku === variantId
          })
        if (idx < 0) throw new Error('Variant not found')

        const prev = Number(form.variants[idx].stock || 0)
        const next = Math.max(0, prev + delta)
        form.variants[idx].stock = String(next)

        const payload = buildProductPayload(form, categories)
        const result = await api.adminUpdateProduct(productId, payload)
        setProduct(result.product)

        appendStockHistory({
          productId,
          variantId,
          productName: product.title,
          sku: form.variants[idx].sku,
          type,
          reason,
          notes,
          previous: prev,
          change: delta,
          newStock: next,
          user: 'Admin',
        })
        setMessage(`Stock updated: ${prev} → ${next}`)
      } catch (err) {
        setError(err.message)
      } finally {
        setSaving(false)
      }
    },
    [product, productId, categories],
  )

  const setStockLevel = useCallback(
    async (variantId, variantIndex, newStock, reason, notes) => {
      const row = inventoryRows.find((r) => String(r.variantId) === String(variantId))
      const current = row?.currentStock || 0
      const delta = newStock - current
      await adjustStock({ variantId, variantIndex, delta, reason, notes, type: 'correction' })
    },
    [inventoryRows, adjustStock],
  )

  const updateMeta = useCallback(
    (variantId, patch) => {
      setVariantMeta(productId, variantId, patch)
      setMessage('Inventory metadata saved locally.')
      load()
    },
    [productId, load],
  )

  const setIncoming = useCallback(
    (variantId, qty) => {
      setIncomingStock(productId, variantId, qty)
      setMessage('Incoming stock updated (local — TODO: purchase API).')
      load()
    },
    [productId, load],
  )

  return {
    product,
    orders,
    inventoryRows,
    history,
    loading,
    error,
    saving,
    message,
    load,
    adjustStock,
    setStockLevel,
    updateMeta,
    setIncoming,
    setMessage,
    setError,
  }
}
