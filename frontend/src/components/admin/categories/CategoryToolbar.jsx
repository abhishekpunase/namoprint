import {
  Archive,
  Download,
  Eye,
  EyeOff,
  LayoutGrid,
  ListTree,
  Printer,
  RefreshCw,
} from 'lucide-react'

export function CategoryBulkActionsBar({
  selectedCount,
  onPublish,
  onHide,
  onArchive,
  onExport,
  onRefresh,
  refreshing,
}) {
  if (!selectedCount) return null

  return (
    <div className="cat-bulk-bar" role="toolbar" aria-label="Bulk actions">
      <strong>{selectedCount} selected</strong>
      <button type="button" className="cat-btn cat-btn--ghost" onClick={onPublish}>
        <Eye size={16} /> Activate
      </button>
      <button type="button" className="cat-btn cat-btn--ghost" onClick={onHide}>
        <EyeOff size={16} /> Hide
      </button>
      <button type="button" className="cat-btn cat-btn--ghost" onClick={onArchive}>
        <Archive size={16} /> Archive
      </button>
      <button type="button" className="cat-btn cat-btn--ghost" onClick={onExport}>
        <Download size={16} /> Export
      </button>
      <button type="button" className="cat-btn cat-btn--ghost" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw size={16} className={refreshing ? 'is-spinning' : ''} /> Refresh
      </button>
      <span className="cat-todo">Bulk parent change: TODO modal</span>
    </div>
  )
}

export function CategoryListToolbar({
  total,
  viewMode,
  onViewModeChange,
  onRefresh,
  onExportCsv,
  onExportExcel,
  onPrint,
  refreshing,
  visibleColumns,
  onToggleColumn,
}) {
  const columns = [
    { id: 'image', label: 'Image' },
    { id: 'name', label: 'Name' },
    { id: 'slug', label: 'Slug' },
    { id: 'parent', label: 'Parent' },
    { id: 'description', label: 'Description' },
    { id: 'products', label: 'Products' },
    { id: 'status', label: 'Status' },
    { id: 'featured', label: 'Featured' },
    { id: 'created', label: 'Created' },
    { id: 'updated', label: 'Updated' },
    { id: 'actions', label: 'Actions' },
  ]

  return (
    <div className="cat-toolbar">
      <div>
        <h2>All Categories</h2>
        <p>{total} categories</p>
      </div>
      <div className="cat-toolbar__actions">
        <div className="cat-view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={`cat-btn cat-btn--ghost ${viewMode === 'table' ? 'is-active' : ''}`}
            onClick={() => onViewModeChange('table')}
            title="Table view"
          >
            <LayoutGrid size={16} /> Table
          </button>
          <button
            type="button"
            className={`cat-btn cat-btn--ghost ${viewMode === 'tree' ? 'is-active' : ''}`}
            onClick={() => onViewModeChange('tree')}
            title="Tree view"
          >
            <ListTree size={16} /> Tree
          </button>
        </div>
        <button type="button" className="cat-btn cat-btn--ghost" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'is-spinning' : ''} /> Refresh
        </button>
        <button type="button" className="cat-btn cat-btn--ghost" onClick={onExportCsv}>
          <Download size={16} /> CSV
        </button>
        <button type="button" className="cat-btn cat-btn--ghost" onClick={onExportExcel}>
          <Download size={16} /> Excel
        </button>
        <button type="button" className="cat-btn cat-btn--ghost" onClick={onPrint}>
          <Printer size={16} /> Print
        </button>
        <details className="cat-column-picker">
          <summary>Columns</summary>
          <div className="cat-column-picker__menu">
            {columns.map((col) => (
              <label key={col.id}>
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col.id)}
                  onChange={() => onToggleColumn(col.id)}
                />
                {col.label}
              </label>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}

export function DeleteCategoryDialog({ open, categoryName, onClose, onConfirm }) {
  if (!open) return null

  return (
    <div className="cat-modal-root" role="dialog" aria-modal="true" aria-labelledby="delete-category-title">
      <button type="button" className="cat-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="cat-modal">
        <h3 id="delete-category-title">Archive category?</h3>
        <p>
          <strong>{categoryName}</strong> will be deactivated. Products will keep their category link.
        </p>
        <div className="cat-modal__actions">
          <button type="button" className="cat-btn cat-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="cat-btn cat-btn--danger" onClick={onConfirm}>
            Archive
          </button>
        </div>
      </div>
    </div>
  )
}
