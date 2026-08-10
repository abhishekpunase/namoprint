import { downloadTextFile } from './userAdminUtils'

export const MEDIA_REGISTRY_KEY = 'omgs_admin_media_registry'
export const MEDIA_META_KEY = 'omgs_admin_media_meta'
export const MEDIA_FOLDERS_KEY = 'omgs_admin_media_folders'
export const MEDIA_ACTIVITY_KEY = 'omgs_admin_media_activity'
export const MEDIA_TRASH_KEY = 'omgs_admin_media_trash'
export const MEDIA_DOWNLOADS_KEY = 'omgs_admin_media_downloads'

export const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024 // TODO: from backend settings

export const DEFAULT_COLUMNS = [
  'preview',
  'name',
  'type',
  'size',
  'resolution',
  'folder',
  'uploadedBy',
  'created',
  'modified',
  'storage',
  'actions',
]

export const VIEW_MODES = ['grid', 'list', 'compact']

export const FILE_CATEGORIES = [
  { value: '', label: 'All types' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'document', label: 'Documents' },
  { value: 'audio', label: 'Audio' },
]

export const EXTENSION_FILTERS = [
  { value: '', label: 'All extensions' },
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WEBP' },
  { value: 'gif', label: 'GIF' },
  { value: 'svg', label: 'SVG' },
  { value: 'pdf', label: 'PDF' },
  { value: 'mp4', label: 'MP4' },
  { value: 'zip', label: 'ZIP' },
]

export const IMAGE_ACCEPT =
  'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/x-icon,image/avif'

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

export function mediaIdFromUrl(url) {
  return String(url || '')
    .split('')
    .reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
    .toString(36)
    .replace('-', 'n')
}

export function getExtension(nameOrUrl = '') {
  const clean = String(nameOrUrl).split('?')[0].split('#')[0]
  const parts = clean.split('.')
  if (parts.length < 2) return ''
  return parts.pop().toLowerCase()
}

export function classifyFile({ url = '', mimeType = '', extension = '' }) {
  const ext = extension || getExtension(url) || getExtension(mimeType)
  const mime = (mimeType || '').toLowerCase()

  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico', 'avif'].includes(ext)) {
    return 'image'
  }
  if (mime.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
    return 'video'
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'aac'].includes(ext)) {
    return 'audio'
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'zip'].includes(ext) || mime.includes('pdf')) {
    return 'document'
  }
  return 'other'
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i += 1
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function formatResolution(width, height) {
  if (!width || !height) return '—'
  return `${width} × ${height}`
}

export function aspectRatio(width, height) {
  if (!width || !height) return '—'
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
  const d = gcd(width, height)
  return `${width / d}:${height / d}`
}

export function inferStorageLocation(url = '') {
  if (!url) return 'unknown'
  if (url.includes('amazonaws.com') || url.includes('s3.')) return 's3'
  if (url.includes('/uploads/') || url.includes('localhost:5000')) return 'local'
  if (url.startsWith('http')) return 'cdn'
  return 'local'
}

export function fileNameFromUrl(url) {
  if (!url) return 'Untitled'
  try {
    const path = new URL(url, 'http://local').pathname
    const base = path.split('/').pop() || 'file'
    return decodeURIComponent(base)
  } catch {
    return url.split('/').pop()?.split('?')[0] || 'file'
  }
}

export function getMediaMeta(id) {
  const all = readJson(MEDIA_META_KEY, {})
  return all[id] || {}
}

export function setMediaMeta(id, patch) {
  const all = readJson(MEDIA_META_KEY, {})
  all[id] = { ...(all[id] || {}), ...patch, updatedAt: new Date().toISOString() }
  writeJson(MEDIA_META_KEY, all)
  return all[id]
}

export function getRegistry() {
  return readJson(MEDIA_REGISTRY_KEY, [])
}

export function addToRegistry(asset, extra = {}) {
  const registry = getRegistry()
  const url = asset.url || asset.optimizedUrl
  const id = asset._id || mediaIdFromUrl(url)
  const existing = registry.findIndex((r) => r.id === id || r.url === url)
  const entry = {
    id,
    url,
    previewUrl: asset.optimizedUrl || asset.url || url,
    originalName: asset.originalName || fileNameFromUrl(url),
    mimeType: asset.mimeType || '',
    sizeBytes: asset.sizeBytes || 0,
    width: asset.width,
    height: asset.height,
    storage: asset.storage || inferStorageLocation(url),
    uploadedAt: new Date().toISOString(),
    uploadedBy: extra.uploadedBy || 'Admin',
    source: 'upload',
    assetId: asset._id,
    ...extra,
  }
  if (existing >= 0) registry[existing] = { ...registry[existing], ...entry }
  else registry.unshift(entry)
  writeJson(MEDIA_REGISTRY_KEY, registry.slice(0, 2000))
  appendMediaActivity({ fileId: id, action: 'File uploaded', detail: entry.originalName })
  return entry
}

export function getFolders() {
  const folders = readJson(MEDIA_FOLDERS_KEY, null)
  if (folders) return folders
  return [{ id: 'root', name: 'All Files', parentId: null }]
}

export function saveFolders(folders) {
  writeJson(MEDIA_FOLDERS_KEY, folders)
}

export function createFolder(name, parentId = 'root') {
  const folders = getFolders()
  const folder = {
    id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    parentId: parentId || 'root',
    createdAt: new Date().toISOString(),
  }
  folders.push(folder)
  saveFolders(folders)
  appendMediaActivity({ action: 'Folder created', detail: folder.name })
  return folder
}

export function renameFolder(folderId, name) {
  const folders = getFolders().map((f) => (f.id === folderId ? { ...f, name: name.trim() } : f))
  saveFolders(folders)
  appendMediaActivity({ action: 'Folder renamed', detail: name })
}

export function deleteFolder(folderId) {
  if (folderId === 'root') return
  const folders = getFolders().filter((f) => f.id !== folderId && f.parentId !== folderId)
  saveFolders(folders)
  appendMediaActivity({ action: 'Folder deleted', detail: folderId })
}

export function getTrash() {
  return readJson(MEDIA_TRASH_KEY, [])
}

export function moveToTrash(item) {
  const trash = getTrash()
  trash.unshift({ ...item, deletedAt: new Date().toISOString() })
  writeJson(MEDIA_TRASH_KEY, trash.slice(0, 500))
  appendMediaActivity({ fileId: item.id, action: 'File deleted', detail: item.name })
}

export function restoreFromTrash(id) {
  const trash = getTrash()
  const item = trash.find((t) => t.id === id)
  writeJson(
    MEDIA_TRASH_KEY,
    trash.filter((t) => t.id !== id),
  )
  if (item) appendMediaActivity({ fileId: id, action: 'File restored', detail: item.name })
  return item
}

export function appendMediaActivity(entry) {
  const logs = readJson(MEDIA_ACTIVITY_KEY, [])
  logs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  })
  writeJson(MEDIA_ACTIVITY_KEY, logs.slice(0, 500))
}

export function getMediaActivity(fileId) {
  const logs = readJson(MEDIA_ACTIVITY_KEY, [])
  if (!fileId) return logs
  return logs.filter((l) => l.fileId === fileId)
}

export function trackDownload(id) {
  const map = readJson(MEDIA_DOWNLOADS_KEY, {})
  map[id] = (map[id] || 0) + 1
  writeJson(MEDIA_DOWNLOADS_KEY, map)
}

export function getDownloadCount(id) {
  const map = readJson(MEDIA_DOWNLOADS_KEY, {})
  return map[id] || 0
}

function pushUsage(usages, usage) {
  const key = `${usage.type}-${usage.id}-${usage.field}`
  if (!usages.some((u) => `${u.type}-${u.id}-${u.field}` === key)) usages.push(usage)
}

export function buildCatalogMediaMap(products = [], categories = [], godProducts = [], namePlates = []) {
  const map = new Map()

  products.forEach((p) => {
    const id = p._id || p.id
    const title = p.title || 'Product'
    const collect = []
    ;(p.images || []).forEach((url, i) => {
      if (url) collect.push({ url, usage: { type: 'product', id, title, field: `images.${i}`, label: 'Product image' } })
    })
    const m = p.mockup || {}
    ;[
      ['frameImage', 'Mockup frame'],
      ['baseImageUrl', 'Mockup base'],
      ['overlayImageUrl', 'Mockup overlay'],
    ].forEach(([field, label]) => {
      if (m[field]) collect.push({ url: m[field], usage: { type: 'product', id, title, field: `mockup.${field}`, label } })
    })
    collect.forEach(({ url, usage }) => {
      const mid = mediaIdFromUrl(url)
      const meta = getMediaMeta(mid)
      const prev = map.get(mid)
      const usages = prev ? [...prev.usages] : []
      pushUsage(usages, usage)
      const ext = getExtension(url)
      map.set(mid, {
        id: mid,
        url,
        previewUrl: url,
        name: meta.name || fileNameFromUrl(url),
        originalName: fileNameFromUrl(url),
        extension: ext,
        category: classifyFile({ url, extension: ext }),
        mimeType: '',
        sizeBytes: meta.sizeBytes || 0,
        width: meta.width,
        height: meta.height,
        folderId: meta.folderId || 'root',
        tags: meta.tags || [],
        description: meta.description || '',
        uploadedBy: meta.uploadedBy || 'Catalog',
        createdAt: meta.createdAt || null,
        updatedAt: meta.updatedAt || null,
        storage: inferStorageLocation(url),
        source: 'catalog',
        usages,
        usageCount: usages.length,
        locked: true,
      })
    })
  })

  categories.forEach((c) => {
    if (!c.imageUrl) return
    const url = c.imageUrl
    const mid = mediaIdFromUrl(url)
    const meta = getMediaMeta(mid)
    const prev = map.get(mid)
    const usages = prev ? [...prev.usages] : []
    pushUsage(usages, { type: 'category', id: c._id || c.id, title: c.name, field: 'imageUrl', label: 'Category image' })
    const ext = getExtension(url)
    map.set(mid, {
      ...(prev || {}),
      id: mid,
      url,
      previewUrl: url,
      name: meta.name || fileNameFromUrl(url),
      originalName: fileNameFromUrl(url),
      extension: ext,
      category: classifyFile({ url, extension: ext }),
      mimeType: '',
      sizeBytes: meta.sizeBytes || 0,
      folderId: meta.folderId || 'root',
      tags: meta.tags || [],
      uploadedBy: meta.uploadedBy || 'Catalog',
      storage: inferStorageLocation(url),
      source: 'catalog',
      usages,
      usageCount: usages.length,
      locked: true,
    })
  })

  ;[...godProducts, ...namePlates].forEach((p) => {
    ;(p.images || []).forEach((url, i) => {
      if (!url) return
      const mid = mediaIdFromUrl(url)
      const meta = getMediaMeta(mid)
      const prev = map.get(mid)
      const usages = prev ? [...prev.usages] : []
      pushUsage(usages, {
        type: p.productType ? 'product' : 'product',
        id: p._id || p.id,
        title: p.title || p.name,
        field: `images.${i}`,
        label: 'Module product image',
      })
      const ext = getExtension(url)
      map.set(mid, {
        ...(prev || {}),
        id: mid,
        url,
        previewUrl: url,
        name: meta.name || fileNameFromUrl(url),
        originalName: fileNameFromUrl(url),
        extension: ext,
        category: classifyFile({ url, extension: ext }),
        folderId: meta.folderId || 'root',
        tags: meta.tags || [],
        uploadedBy: meta.uploadedBy || 'Catalog',
        storage: inferStorageLocation(url),
        source: 'catalog',
        usages,
        usageCount: usages.length,
        locked: true,
      })
    })
  })

  return map
}

export function mergeMediaItems(catalogMap, registry = [], trashIds = new Set()) {
  const map = new Map(catalogMap)

  registry.forEach((item) => {
    if (trashIds.has(item.id)) return
    const meta = getMediaMeta(item.id)
    const ext = getExtension(item.originalName || item.url)
    map.set(item.id, {
      id: item.id,
      url: item.url,
      previewUrl: item.previewUrl || item.url,
      name: meta.name || item.originalName || fileNameFromUrl(item.url),
      originalName: item.originalName || fileNameFromUrl(item.url),
      extension: ext,
      category: classifyFile({ url: item.url, mimeType: item.mimeType, extension: ext }),
      mimeType: item.mimeType || '',
      sizeBytes: item.sizeBytes || 0,
      width: item.width,
      height: item.height,
      folderId: meta.folderId || item.folderId || 'root',
      tags: meta.tags || item.tags || [],
      description: meta.description || '',
      uploadedBy: item.uploadedBy || meta.uploadedBy || 'Admin',
      createdAt: item.uploadedAt || item.createdAt || meta.createdAt,
      updatedAt: meta.updatedAt || item.updatedAt,
      storage: item.storage || inferStorageLocation(item.url),
      source: item.source || 'upload',
      usages: item.usages || [],
      usageCount: item.usages?.length || 0,
      locked: false,
      assetId: item.assetId,
    })
  })

  return [...map.values()].filter((item) => !trashIds.has(item.id))
}

export function computeMediaDashboard(items = [], registry = []) {
  const today = new Date().toDateString()
  const usedBytes = items.reduce((s, i) => s + (i.sizeBytes || 0), 0)
  const uploadsToday = registry.filter((r) => new Date(r.uploadedAt).toDateString() === today).length
  const downloads = readJson(MEDIA_DOWNLOADS_KEY, {})
  const recentDownloads = Object.values(downloads).reduce((s, n) => s + n, 0)

  return {
    total: items.length,
    images: items.filter((i) => i.category === 'image').length,
    videos: items.filter((i) => i.category === 'video').length,
    documents: items.filter((i) => i.category === 'document').length,
    audio: items.filter((i) => i.category === 'audio').length,
    storageUsed: usedBytes,
    storageAvailable: Math.max(0, STORAGE_QUOTA_BYTES - usedBytes),
    storageQuota: STORAGE_QUOTA_BYTES,
    uploadsToday,
    recentDownloads,
  }
}

export function matchesMediaSearch(item, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [item.name, item.originalName, item.extension, item.description, ...(item.tags || [])]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q))
}

export function matchesMediaFilters(item, filters) {
  if (filters.category && item.category !== filters.category) return false
  if (filters.extension && item.extension !== filters.extension) return false
  if (filters.folder && item.folderId !== filters.folder) return false
  if (filters.source && item.source !== filters.source) return false
  if (filters.tag && !(item.tags || []).includes(filters.tag)) return false
  if (filters.minSize && (item.sizeBytes || 0) < Number(filters.minSize) * 1024) return false
  if (filters.maxSize && (item.sizeBytes || 0) > Number(filters.maxSize) * 1024) return false
  return true
}

export function exportMediaCsv(items) {
  const header = ['Name', 'Type', 'Extension', 'Size', 'Folder', 'URL', 'Usage Count', 'Storage']
  const rows = items.map((i) =>
    [i.name, i.category, i.extension, i.sizeBytes, i.folderId, i.url, i.usageCount, i.storage]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...rows].join('\n')
}

export function downloadMediaExport(items, format = 'csv') {
  downloadTextFile(
    `media-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'csv' : 'csv'}`,
    exportMediaCsv(items),
  )
}

export function copyToClipboard(text) {
  return navigator.clipboard?.writeText(text)
}

export function getFolderName(folders, folderId) {
  if (!folderId || folderId === 'root') return 'All Files'
  return folders.find((f) => f.id === folderId)?.name || folderId
}

export function getMediaAnalytics(items) {
  const bySize = [...items].sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0)).slice(0, 5)
  const byUsage = [...items].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 5)
  const recent = [...items]
    .filter((i) => i.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
  const downloads = readJson(MEDIA_DOWNLOADS_KEY, {})
  const mostDownloaded = [...items]
    .map((i) => ({ ...i, downloads: downloads[i.id] || 0 }))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
  return { bySize, byUsage, recent, mostDownloaded }
}
