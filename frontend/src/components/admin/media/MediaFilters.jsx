import { FILE_CATEGORIES, EXTENSION_FILTERS } from '../../../utils/mediaAdminUtils'

export function MediaSearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      className="med-search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <input
        placeholder="Search file name, extension, tags, description…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </form>
  )
}

export function MediaFilters({ filters, onChange, folders, onClear }) {
  return (
    <div className="med-filters">
      <label>
        Type
        <select value={filters.category} onChange={(e) => onChange({ ...filters, category: e.target.value })}>
          {FILE_CATEGORIES.map((c) => (
            <option key={c.value || 'all'} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>
      <label>
        Extension
        <select value={filters.extension} onChange={(e) => onChange({ ...filters, extension: e.target.value })}>
          {EXTENSION_FILTERS.map((e) => (
            <option key={e.value || 'all'} value={e.value}>{e.label}</option>
          ))}
        </select>
      </label>
      <label>
        Folder
        <select value={filters.folder} onChange={(e) => onChange({ ...filters, folder: e.target.value })}>
          <option value="">Any folder</option>
          {folders.filter((f) => f.id !== 'root').map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </label>
      <label>
        Source
        <select value={filters.source} onChange={(e) => onChange({ ...filters, source: e.target.value })}>
          <option value="">All sources</option>
          <option value="catalog">Catalog (products/categories)</option>
          <option value="upload">Media library uploads</option>
        </select>
      </label>
      <label>
        Min size (KB)
        <input type="number" min={0} value={filters.minSize} onChange={(e) => onChange({ ...filters, minSize: e.target.value })} />
      </label>
      <label>
        Max size (KB)
        <input type="number" min={0} value={filters.maxSize} onChange={(e) => onChange({ ...filters, maxSize: e.target.value })} />
      </label>
      <button type="button" className="med-btn med-btn--ghost" onClick={onClear}>Clear filters</button>
    </div>
  )
}

const COLUMN_OPTIONS = [
  { id: 'preview', label: 'Preview' },
  { id: 'name', label: 'File Name' },
  { id: 'type', label: 'Type' },
  { id: 'size', label: 'Size' },
  { id: 'resolution', label: 'Resolution' },
  { id: 'folder', label: 'Folder' },
  { id: 'uploadedBy', label: 'Uploaded By' },
  { id: 'created', label: 'Created' },
  { id: 'modified', label: 'Modified' },
  { id: 'storage', label: 'Storage' },
  { id: 'actions', label: 'Actions' },
]

export function MediaToolbar({
  total,
  selectedCount,
  viewMode,
  onViewModeChange,
  onRefresh,
  refreshing,
  onExportCsv,
  onExportExcel,
  onUploadClick,
  visibleColumns,
  onToggleColumn,
  onBulkDelete,
  onBulkMove,
  onBulkExport,
}) {
  return (
    <>
      {selectedCount > 0 ? (
        <div className="med-bulk-bar">
          <strong>{selectedCount} selected</strong>
          <button type="button" className="med-btn med-btn--ghost" onClick={onBulkDelete}>Bulk Delete</button>
          <button type="button" className="med-btn med-btn--ghost" onClick={onBulkMove}>Bulk Move</button>
          <button type="button" className="med-btn med-btn--ghost" onClick={onBulkExport}>Bulk Export</button>
        </div>
      ) : null}
      <div className="med-toolbar">
        <div>
          <h2>Media Library</h2>
          <p>{total} files</p>
        </div>
        <div className="med-toolbar__actions">
          <div className="med-view-toggle">
            {['grid', 'list', 'compact'].map((mode) => (
              <button
                key={mode}
                type="button"
                className={`med-btn med-btn--ghost med-btn--sm ${viewMode === mode ? 'is-active' : ''}`}
                onClick={() => onViewModeChange(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
          <button type="button" className="med-btn med-btn--primary" onClick={onUploadClick}>Upload</button>
          <button type="button" className="med-btn med-btn--ghost" onClick={onRefresh} disabled={refreshing}>Refresh</button>
          <button type="button" className="med-btn med-btn--ghost" onClick={onExportCsv}>CSV</button>
          <button type="button" className="med-btn med-btn--ghost" onClick={onExportExcel}>Excel</button>
          <details className="med-column-picker">
            <summary>Columns</summary>
            <div className="med-column-picker__menu">
              {COLUMN_OPTIONS.map((col) => (
                <label key={col.id}>
                  <input type="checkbox" checked={visibleColumns.includes(col.id)} onChange={() => onToggleColumn(col.id)} />
                  {col.label}
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>
    </>
  )
}

export function MediaPagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="med-pagination">
      <label>
        Per page
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[12, 24, 48, 96].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <div className="med-pagination__nav">
        <button type="button" className="med-btn med-btn--ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="med-btn med-btn--ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </div>
  )
}
