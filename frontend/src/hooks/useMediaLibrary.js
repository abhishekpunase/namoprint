import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { godApi } from '../services/godApi'
import { namePlateApi } from '../services/namePlateApi'
import {
  DEFAULT_COLUMNS,
  addToRegistry,
  appendMediaActivity,
  buildCatalogMediaMap,
  computeMediaDashboard,
  createFolder,
  deleteFolder,
  downloadMediaExport,
  getFolders,
  getMediaActivity,
  getMediaAnalytics,
  getRegistry,
  getTrash,
  mergeMediaItems,
  matchesMediaFilters,
  matchesMediaSearch,
  moveToTrash,
  renameFolder,
  restoreFromTrash,
  setMediaMeta,
  trackDownload,
} from '../utils/mediaAdminUtils'

export function useMediaLibrary() {
  const [items, setItems] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)
  const [viewMode, setViewMode] = useState('grid')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS)
  const [refreshing, setRefreshing] = useState(false)
  const [currentFolder, setCurrentFolder] = useState('root')
  const [filters, setFilters] = useState({
    category: '',
    extension: '',
    folder: '',
    source: '',
    tag: '',
    minSize: '',
    maxSize: '',
  })
  const [activity, setActivity] = useState([])
  const [trash, setTrash] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [productsPayload, categoriesPayload, godPayload, namePlatePayload] = await Promise.all([
        api.adminProducts(),
        api.adminCategories(),
        godApi.adminList().catch(() => ({ products: [] })),
        namePlateApi.adminList().catch(() => ({ products: [] })),
      ])

      const catalogMap = buildCatalogMediaMap(
        productsPayload.products || [],
        categoriesPayload.categories || [],
        godPayload.products || godPayload.items || [],
        namePlatePayload.products || namePlatePayload.items || [],
      )
      const trashItems = getTrash()
      const trashIds = new Set(trashItems.map((t) => t.id))
      const merged = mergeMediaItems(catalogMap, getRegistry(), trashIds)
      setItems(merged)
      setFolders(getFolders())
      setActivity(getMediaActivity())
      setTrash(trashItems)
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

  const effectiveFilters = useMemo(
    () => ({ ...filters, folder: currentFolder !== 'root' ? currentFolder : filters.folder }),
    [filters, currentFolder],
  )

  const filtered = useMemo(() => {
    let list = [...items]
    if (currentFolder !== 'root') list = list.filter((i) => i.folderId === currentFolder)
    if (search.trim()) list = list.filter((i) => matchesMediaSearch(i, search))
    list = list.filter((i) => matchesMediaFilters(i, effectiveFilters))

    list.sort((a, b) => {
      let left = a[sortKey]
      let right = b[sortKey]
      if (sortKey === 'name') {
        left = a.name || ''
        right = b.name || ''
      }
      if (sortKey === 'size') {
        left = a.sizeBytes || 0
        right = b.sizeBytes || 0
      }
      if (sortKey === 'createdAt') {
        left = new Date(a.createdAt || 0).getTime()
        right = new Date(b.createdAt || 0).getTime()
      }
      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [items, search, effectiveFilters, sortKey, sortDir, currentFolder])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const dashboard = useMemo(() => computeMediaDashboard(items, getRegistry()), [items])
  const analytics = useMemo(() => getMediaAnalytics(items), [items])

  const toggleSelect = useCallback((id) => {
    setSelected((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }, [])

  const toggleSelectAll = useCallback(() => {
    const ids = paginated.map((i) => i.id)
    setSelected((c) => (c.length === ids.length ? [] : ids))
  }, [paginated])

  const getExportRows = useCallback(() => {
    if (selected.length) return filtered.filter((i) => selected.includes(i.id))
    return filtered
  }, [filtered, selected])

  const registerUpload = useCallback(
    (asset, extra) => {
      addToRegistry(asset, extra)
      load()
    },
    [load],
  )

  const renameFile = useCallback(
    (id, name) => {
      setMediaMeta(id, { name })
      appendMediaActivity({ fileId: id, action: 'File renamed', detail: name })
      load()
    },
    [load],
  )

  const moveFiles = useCallback(
    (ids, folderId) => {
      ids.forEach((id) => setMediaMeta(id, { folderId }))
      appendMediaActivity({ action: 'File moved', detail: `${ids.length} file(s)` })
      load()
    },
    [load],
  )

  const setTags = useCallback(
    (id, tags) => {
      setMediaMeta(id, { tags })
      load()
    },
    [load],
  )

  const deleteFiles = useCallback(
    (ids) => {
      const toTrash = items.filter((i) => ids.includes(i.id) && !i.locked)
      toTrash.forEach(moveToTrash)
      load()
      setSelected([])
      return toTrash.length
    },
    [items, load],
  )

  const restoreFile = useCallback(
    (id) => {
      restoreFromTrash(id)
      load()
    },
    [load],
  )

  const addFolder = useCallback(
    (name, parentId) => {
      createFolder(name, parentId || currentFolder)
      setFolders(getFolders())
    },
    [currentFolder],
  )

  const renameFolderById = useCallback((folderId, name) => {
    renameFolder(folderId, name)
    setFolders(getFolders())
  }, [])

  const removeFolder = useCallback(
    (folderId) => {
      deleteFolder(folderId)
      setFolders(getFolders())
      if (currentFolder === folderId) setCurrentFolder('root')
    },
    [currentFolder],
  )

  const recordDownload = useCallback((id) => {
    trackDownload(id)
  }, [])

  return {
    items,
    folders,
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
    viewMode,
    setViewMode,
    sortKey,
    setSortKey,
    sortDir,
    setSortDir,
    visibleColumns,
    setVisibleColumns,
    filters,
    setFilters,
    currentFolder,
    setCurrentFolder,
    filtered,
    paginated,
    total: filtered.length,
    dashboard,
    analytics,
    activity,
    trash,
    load,
    refresh,
    refreshing,
    toggleSelect,
    toggleSelectAll,
    registerUpload,
    renameFile,
    moveFiles,
    setTags,
    deleteFiles,
    restoreFile,
    addFolder,
    renameFolderById,
    removeFolder,
    recordDownload,
    exportCsv: () => downloadMediaExport(getExportRows(), 'csv'),
    exportExcel: () => downloadMediaExport(getExportRows(), 'excel'),
  }
}
