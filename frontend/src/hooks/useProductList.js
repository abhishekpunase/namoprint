import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import {
  isCatalogDemoProduct,
  loadAdminProductCatalog,
} from '../utils/adminProductCatalog'
import { getMinPrice, getPrimarySku, getProductStatus, getTotalStock } from '../utils/productFormUtils'

const DEFAULT_COLUMNS = [
  'image',
  'name',
  'sku',
  'category',
  'brand',
  'price',
  'salePrice',
  'stock',
  'status',
  'visibility',
  'featured',
  'created',
  'updated',
  'actions',
]

export function useProductList() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState('updatedAt')
  const [sortDir, setSortDir] = useState('desc')
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS)
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    brand: '',
    stockStatus: '',
    status: '',
    featured: '',
    catalogSource: '',
    priceMin: '',
    priceMax: '',
    dateFrom: '',
    dateTo: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [mergedProducts, categoriesPayload] = await Promise.all([
        loadAdminProductCatalog(),
        api.adminCategories(),
      ])
      setProducts(mergedProducts)
      setCategories(categoriesPayload.categories || [])
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
    let list = [...products]
    const q = search.trim().toLowerCase()

    if (q) {
      list = list.filter((product) => {
        const sku = getPrimarySku(product).toLowerCase()
        const category = product.category?.name?.toLowerCase() || ''
        const brand = product.attributes?.brand?.[0]?.toLowerCase() || ''
        const tags = (product.attributes?.theme || []).join(' ').toLowerCase()
        return (
          product.title?.toLowerCase().includes(q) ||
          product.slug?.toLowerCase().includes(q) ||
          sku.includes(q) ||
          category.includes(q) ||
          brand.includes(q) ||
          tags.includes(q) ||
          product.productType?.toLowerCase().includes(q)
        )
      })
    }

    if (filters.category) {
      list = list.filter((p) => (p.category?._id || p.category) === filters.category)
    }

    if (filters.subcategory) {
      list = list.filter((p) => (p.subCategory?._id || p.subCategory) === filters.subcategory)
    }

    if (filters.brand) {
      list = list.filter((p) => p.attributes?.brand?.[0] === filters.brand)
    }

    if (filters.featured === 'yes') list = list.filter((p) => p.isFeatured)
    if (filters.featured === 'no') list = list.filter((p) => !p.isFeatured)

    if (filters.catalogSource === 'database') list = list.filter((p) => !isCatalogDemoProduct(p))
    if (filters.catalogSource === 'demo') list = list.filter((p) => isCatalogDemoProduct(p))

    if (filters.status === 'published') list = list.filter((p) => p.isActive)
    if (filters.status === 'draft') list = list.filter((p) => !p.isActive)
    if (filters.status === 'hidden') list = list.filter((p) => !p.isActive)

    if (filters.stockStatus === 'in') list = list.filter((p) => getTotalStock(p) > 5)
    if (filters.stockStatus === 'low') list = list.filter((p) => getTotalStock(p) > 0 && getTotalStock(p) <= 5)
    if (filters.stockStatus === 'out') list = list.filter((p) => getTotalStock(p) <= 0)

    if (filters.priceMin) list = list.filter((p) => getMinPrice(p) >= Number(filters.priceMin))
    if (filters.priceMax) list = list.filter((p) => getMinPrice(p) <= Number(filters.priceMax))

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      list = list.filter((p) => new Date(p.createdAt) >= from)
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      list = list.filter((p) => new Date(p.createdAt) <= to)
    }

    list.sort((a, b) => {
      let left
      let right
      switch (sortKey) {
        case 'title':
          left = a.title || ''
          right = b.title || ''
          break
        case 'price':
          left = getMinPrice(a)
          right = getMinPrice(b)
          break
        case 'stock':
          left = getTotalStock(a)
          right = getTotalStock(b)
          break
        case 'createdAt':
          left = new Date(a.createdAt).getTime()
          right = new Date(b.createdAt).getTime()
          break
        default:
          left = new Date(a.updatedAt || a.createdAt).getTime()
          right = new Date(b.updatedAt || b.createdAt).getTime()
      }
      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [products, search, filters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleSelectAll = () => {
    if (selected.length === paginated.length) setSelected([])
    else setSelected(paginated.map((p) => p._id))
  }

  const toggleSelect = (id) => {
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
  }

  const bulkUpdate = async (mutator) => {
    const targets = products.filter((p) => selected.includes(p._id) && !isCatalogDemoProduct(p))
    for (const product of targets) {
      await mutator(product)
    }
    setSelected([])
    await load()
  }

  const bulkDeactivate = () =>
    bulkUpdate((product) => api.adminDeleteProduct(product._id))

  const bulkPublish = () =>
    bulkUpdate((product) => api.adminUpdateProduct(product._id, { isActive: true }))

  const bulkHide = () =>
    bulkUpdate((product) => api.adminUpdateProduct(product._id, { isActive: false }))

  const bulkFeature = (value) =>
    bulkUpdate((product) => api.adminUpdateProduct(product._id, { isFeatured: value }))

  const exportRows = (rows) =>
    rows.map((product) => ({
      Name: product.title,
      SKU: getPrimarySku(product),
      Category: product.category?.name || '',
      Price: getMinPrice(product),
      Stock: getTotalStock(product),
      Status: getProductStatus(product).label,
      Featured: product.isFeatured ? 'Yes' : 'No',
      Slug: product.slug,
      Created: product.createdAt,
      Updated: product.updatedAt,
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
    link.download = `products-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportExcel = (rows = filtered) => exportCsv(rows)

  const printTable = () => window.print()

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.attributes?.brand?.[0]).filter(Boolean))],
    [products],
  )

  return {
    products,
    categories,
    loading,
    error,
    search,
    setSearch,
    filters,
    setFilters,
    filtered,
    paginated,
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
    load,
    bulkDeactivate,
    bulkPublish,
    bulkHide,
    bulkFeature,
    exportCsv,
    exportExcel,
    printTable,
    brands,
  }
}
