import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { loadAdminProductCatalog } from '../utils/adminProductCatalog'
import {
  buildCategoryTree,
  countProductsForCategory,
  getCategoryParentName,
  getCategoryStatus,
} from '../utils/categoryFormUtils'

const DEFAULT_COLUMNS = [
  'image',
  'name',
  'slug',
  'parent',
  'description',
  'products',
  'status',
  'featured',
  'created',
  'updated',
  'actions',
]

export function useCategoryList() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState('sortOrder')
  const [sortDir, setSortDir] = useState('asc')
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS)
  const [sidebarFilter, setSidebarFilter] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [filters, setFilters] = useState({
    status: '',
    parent: '',
    productCount: '',
    dateFrom: '',
    dateTo: '',
    featured: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [categoriesPayload, productCatalog] = await Promise.all([
        api.adminCategories(),
        loadAdminProductCatalog(),
      ])
      setCategories(categoriesPayload.categories || [])
      setProducts(productCatalog)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const tree = useMemo(() => buildCategoryTree(categories), [categories])

  const filtered = useMemo(() => {
    let list = [...categories]
    const q = search.trim().toLowerCase()

    if (sidebarFilter === 'parents') list = list.filter((c) => !(c.parent?._id || c.parent))
    if (sidebarFilter === 'featured') list = list.filter((c) => (c.sortOrder ?? 0) <= 3 && c.isActive)
    if (sidebarFilter === 'recent') {
      list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20)
    }
    if (sidebarFilter === 'archived') list = list.filter((c) => !c.isActive)

    if (q) {
      list = list.filter((cat) => {
        const parent = getCategoryParentName(cat, categories).toLowerCase()
        return (
          cat.name?.toLowerCase().includes(q) ||
          cat.slug?.toLowerCase().includes(q) ||
          cat.description?.toLowerCase().includes(q) ||
          parent.includes(q) ||
          cat.productType?.toLowerCase().includes(q)
        )
      })
    }

    if (filters.status === 'active') list = list.filter((c) => c.isActive)
    if (filters.status === 'inactive') list = list.filter((c) => !c.isActive)
    if (filters.parent) list = list.filter((c) => (c.parent?._id || c.parent) === filters.parent)
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      list = list.filter((c) => new Date(c.createdAt) >= from)
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      list = list.filter((c) => new Date(c.createdAt) <= to)
    }

    if (filters.productCount === '0') list = list.filter((c) => countProductsForCategory(c._id, products) === 0)
    if (filters.productCount === '1+') list = list.filter((c) => countProductsForCategory(c._id, products) > 0)
    if (filters.productCount === '10+') list = list.filter((c) => countProductsForCategory(c._id, products) >= 10)

    list.sort((a, b) => {
      let left
      let right
      switch (sortKey) {
        case 'name':
          left = a.name || ''
          right = b.name || ''
          break
        case 'products':
          left = countProductsForCategory(a._id, products)
          right = countProductsForCategory(b._id, products)
          break
        case 'createdAt':
          left = new Date(a.createdAt).getTime()
          right = new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          left = new Date(a.updatedAt || a.createdAt).getTime()
          right = new Date(b.updatedAt || b.createdAt).getTime()
          break
        default:
          left = a.sortOrder ?? 0
          right = b.sortOrder ?? 0
      }
      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [categories, search, filters, sortKey, sortDir, products, sidebarFilter])

  const filteredTree = useMemo(() => buildCategoryTree(filtered), [filtered])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleSelectAll = () => {
    if (selected.length === paginated.length) setSelected([])
    else setSelected(paginated.map((c) => c._id))
  }

  const toggleSelect = (id) => {
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
  }

  const toggleExpanded = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bulkUpdate = async (mutator) => {
    const targets = categories.filter((c) => selected.includes(c._id))
    for (const category of targets) {
      await mutator(category)
    }
    setSelected([])
    await load()
  }

  const bulkActivate = () => bulkUpdate((cat) => api.adminUpdateCategory(cat._id, { isActive: true }))
  const bulkHide = () => bulkUpdate((cat) => api.adminUpdateCategory(cat._id, { isActive: false }))
  const bulkArchive = () => bulkUpdate((cat) => api.adminDeleteCategory(cat._id))

  const reorderCategory = async (categoryId, { parent, sortOrder }) => {
    await api.adminUpdateCategory(categoryId, {
      parent: parent || undefined,
      sortOrder,
    })
    await load()
  }

  const exportRows = (rows) =>
    rows.map((cat) => ({
      Name: cat.name,
      Slug: cat.slug,
      'Product Type': cat.productType,
      Parent: getCategoryParentName(cat, categories),
      Description: cat.description || '',
      Products: countProductsForCategory(cat._id, products),
      Status: getCategoryStatus(cat).label,
      'Sort Order': cat.sortOrder ?? 0,
      Created: cat.createdAt,
      Updated: cat.updatedAt,
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
    link.download = `categories-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportExcel = (rows = filtered) => exportCsv(rows)
  const printTable = () => window.print()

  const parentCategories = useMemo(() => categories.filter((c) => !(c.parent?._id || c.parent)), [categories])

  return {
    categories,
    products,
    tree,
    filteredTree,
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
    sidebarFilter,
    setSidebarFilter,
    viewMode,
    setViewMode,
    expandedIds,
    toggleExpanded,
    load,
    bulkActivate,
    bulkHide,
    bulkArchive,
    reorderCategory,
    exportCsv,
    exportExcel,
    printTable,
    parentCategories,
    countProducts: (id) => countProductsForCategory(id, products),
  }
}
