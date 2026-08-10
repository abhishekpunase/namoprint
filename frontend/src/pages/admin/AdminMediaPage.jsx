import { Link } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../../services/api'
import { useMediaLibrary } from '../../hooks/useMediaLibrary'
import { MediaDashboard } from '../../components/admin/media/MediaDashboard'
import {
  MediaFilters,
  MediaSearchBar,
  MediaToolbar,
  MediaPagination,
} from '../../components/admin/media/MediaFilters'
import { MediaGrid, MediaGridSkeleton, MediaTable } from '../../components/admin/media/MediaGrid'
import { FolderTree } from '../../components/admin/media/FolderTree'
import { UploadManager } from '../../components/admin/media/UploadManager'
import { MediaPreviewModal, ImageEditorPanel } from '../../components/admin/media/MediaPreview'
import {
  MediaDetailsDrawer,
  MediaAnalyticsPanel,
  MediaActivityPanel,
} from '../../components/admin/media/MediaDetails'

export function AdminMediaPage() {
  const lib = useMediaLibrary()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [editorItem, setEditorItem] = useState(null)
  const [toast, setToast] = useState('')

  const handleSort = (key) => {
    if (lib.sortKey === key) lib.setSortDir(lib.sortDir === 'asc' ? 'desc' : 'asc')
    else {
      lib.setSortKey(key)
      lib.setSortDir('asc')
    }
  }

  const toggleColumn = (col) => {
    lib.setVisibleColumns((c) => (c.includes(col) ? c.filter((x) => x !== col) : [...c, col]))
  }

  const clearFilters = () => {
    lib.setSearch('')
    lib.setFilters({ category: '', extension: '', folder: '', source: '', tag: '', minSize: '', maxSize: '' })
  }

  const allSelected = lib.paginated.length > 0 && lib.selected.length === lib.paginated.length

  const openItem = (item) => {
    setDetailItem(item)
  }

  const handleBulkDelete = () => {
    const count = lib.deleteFiles(lib.selected)
    setToast(count ? `Moved ${count} file(s) to trash (local only)` : 'Catalog-linked files cannot be deleted here')
    lib.setSelected([])
  }

  const handleBulkMove = () => {
    const folderId = window.prompt('Target folder ID (or root):', lib.currentFolder)
    if (folderId) {
      lib.moveFiles(lib.selected, folderId === 'root' ? 'root' : folderId)
      lib.setSelected([])
      setToast('Files moved (metadata)')
    }
  }

  const handleDownload = (item) => {
    lib.recordDownload(item.id)
    setToast('Download started')
  }

  const handleEditorSave = async (blob, item) => {
    try {
      const file = new File([blob], `${item.name || 'edited'}.jpg`, { type: 'image/jpeg' })
      const payload = await api.uploadPhoto(file)
      lib.registerUpload(payload.asset, { folderId: item.folderId, uploadedBy: 'Admin' })
      setEditorItem(null)
      setToast('Edited image uploaded as new asset')
    } catch (err) {
      setToast(err.message)
    }
  }

  const showGrid = lib.viewMode === 'grid' || lib.viewMode === 'compact'

  return (
    <div className="med-page">
      <header className="med-page-header">
        <div>
          <nav className="med-breadcrumb"><Link to="/admin">Admin</Link> / <span>Media Library</span></nav>
          <h1>Media Library &amp; File Manager</h1>
          <p>Aggregates assets from products, categories, and <code>POST /uploads/photo</code>. Full DAM API: TODO.</p>
        </div>
        <MediaSearchBar value={lib.search} onChange={lib.setSearch} onSubmit={lib.refresh} />
      </header>

      {lib.error ? (
        <div className="med-message med-message--err">
          {lib.error}
          <button type="button" className="med-btn med-btn--ghost" style={{ marginLeft: 8 }} onClick={lib.refresh}>Retry</button>
        </div>
      ) : null}
      {toast ? <p className="med-message">{toast}</p> : null}

      <MediaDashboard stats={lib.dashboard} loading={lib.loading} />

      <div className="med-quick-actions">
        <button type="button" className="med-btn med-btn--primary" onClick={() => setUploadOpen(true)}>Upload Files</button>
        <button type="button" className="med-btn med-btn--ghost" onClick={lib.exportCsv}>Export</button>
        <button type="button" className="med-btn med-btn--ghost" onClick={lib.refresh}>Refresh</button>
      </div>

      <MediaFilters filters={lib.filters} onChange={lib.setFilters} folders={lib.folders} onClear={clearFilters} />

      <div className="med-layout">
        <FolderTree
          folders={lib.folders}
          currentFolder={lib.currentFolder}
          onSelect={(id) => { lib.setCurrentFolder(id); lib.setPage(1) }}
          onCreate={lib.addFolder}
          onDelete={lib.removeFolder}
        />

        <section className="med-panel">
          <MediaToolbar
            total={lib.total}
            selectedCount={lib.selected.length}
            viewMode={lib.viewMode}
            onViewModeChange={lib.setViewMode}
            onRefresh={lib.refresh}
            refreshing={lib.refreshing}
            onExportCsv={lib.exportCsv}
            onExportExcel={lib.exportExcel}
            onUploadClick={() => setUploadOpen(true)}
            visibleColumns={lib.visibleColumns}
            onToggleColumn={toggleColumn}
            onBulkDelete={handleBulkDelete}
            onBulkMove={handleBulkMove}
            onBulkExport={lib.exportCsv}
          />

          {lib.loading ? (
            <MediaGridSkeleton />
          ) : showGrid ? (
            <>
              <MediaGrid
                items={lib.paginated}
                selected={lib.selected}
                onToggleSelect={lib.toggleSelect}
                onOpen={openItem}
                viewMode={lib.viewMode}
                folders={lib.folders}
              />
              <MediaPagination
                page={lib.page}
                pageSize={lib.pageSize}
                total={lib.total}
                onPageChange={lib.setPage}
                onPageSizeChange={(size) => { lib.setPageSize(size); lib.setPage(1) }}
              />
            </>
          ) : (
            <>
              <MediaTable
                items={lib.paginated}
                selected={lib.selected}
                onToggleSelect={lib.toggleSelect}
                onToggleSelectAll={lib.toggleSelectAll}
                allSelected={allSelected}
                visibleColumns={lib.visibleColumns}
                sortKey={lib.sortKey}
                sortDir={lib.sortDir}
                onSort={handleSort}
                onOpen={openItem}
                folders={lib.folders}
              />
              <MediaPagination
                page={lib.page}
                pageSize={lib.pageSize}
                total={lib.total}
                onPageChange={lib.setPage}
                onPageSizeChange={(size) => { lib.setPageSize(size); lib.setPage(1) }}
              />
            </>
          )}
        </section>
      </div>

      <div className="med-analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <MediaAnalyticsPanel analytics={lib.analytics} />
        <MediaActivityPanel activity={lib.activity} />
      </div>

      <UploadManager
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={lib.registerUpload}
        folderId={lib.currentFolder}
      />

      <MediaDetailsDrawer
        item={detailItem}
        folders={lib.folders}
        onClose={() => setDetailItem(null)}
        onRename={lib.renameFile}
        onDelete={(id) => {
          const n = lib.deleteFiles([id])
          setDetailItem(null)
          setToast(n ? 'File moved to trash' : 'Cannot delete catalog-linked file')
        }}
        onEdit={(item) => { setEditorItem(item); setDetailItem(null) }}
        onDownload={handleDownload}
        onTagsChange={lib.setTags}
      />

      <MediaPreviewModal
        item={previewItem}
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        onDownload={handleDownload}
        onCopyUrl={() => setToast('URL copied')}
      />

      <ImageEditorPanel
        item={editorItem}
        open={Boolean(editorItem)}
        onClose={() => setEditorItem(null)}
        onSave={handleEditorSave}
      />
    </div>
  )
}
