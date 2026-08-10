import {
  Archive,
  Download,
  Eye,
  EyeOff,
  Printer,
  RefreshCw,
  Star,
  Trash2,
} from 'lucide-react'

export function BulkActionsBar({
  selectedCount,
  onPublish,
  onHide,
  onArchive,
  onFeature,
  onExport,
  onRefresh,
  refreshing,
}) {
  if (!selectedCount) return null

  return (
    <div className="prod-bulk-bar" role="toolbar" aria-label="Bulk actions">
      <strong>{selectedCount} selected</strong>
      <button type="button" className="prod-btn prod-btn--ghost" onClick={onPublish}>
        <Eye size={16} /> Publish
      </button>
      <button type="button" className="prod-btn prod-btn--ghost" onClick={onHide}>
        <EyeOff size={16} /> Hide
      </button>
      <button type="button" className="prod-btn prod-btn--ghost" onClick={onFeature}>
        <Star size={16} /> Feature
      </button>
      <button type="button" className="prod-btn prod-btn--ghost" onClick={onArchive}>
        <Archive size={16} /> Archive
      </button>
      <button type="button" className="prod-btn prod-btn--ghost" onClick={onExport}>
        <Download size={16} /> Export selected
      </button>
      <button type="button" className="prod-btn prod-btn--ghost" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw size={16} className={refreshing ? 'is-spinning' : ''} /> Refresh
      </button>
      <span className="prod-bulk-bar__todo">Bulk price/stock/category: TODO per-item API loop</span>
    </div>
  )
}

export function ProductListToolbar({
  total,
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
    { id: 'sku', label: 'SKU' },
    { id: 'category', label: 'Category' },
    { id: 'brand', label: 'Brand' },
    { id: 'price', label: 'Price' },
    { id: 'salePrice', label: 'Sale Price' },
    { id: 'stock', label: 'Stock' },
    { id: 'status', label: 'Status' },
    { id: 'visibility', label: 'Visibility' },
    { id: 'featured', label: 'Featured' },
    { id: 'created', label: 'Created' },
    { id: 'updated', label: 'Updated' },
    { id: 'actions', label: 'Actions' },
  ]

  return (
    <div className="prod-toolbar">
      <div>
        <h2>All Products</h2>
        <p>{total} products</p>
      </div>
      <div className="prod-toolbar__actions">
        <details className="prod-column-picker">
          <summary>Columns</summary>
          <div className="prod-column-picker__menu">
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
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'is-spinning' : ''} /> Refresh
        </button>
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onExportCsv}>
          <Download size={16} /> CSV
        </button>
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onExportExcel}>
          <Download size={16} /> Excel
        </button>
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onPrint}>
          <Printer size={16} /> Print
        </button>
      </div>
    </div>
  )
}

export function DeleteProductDialog({ open, onClose, onConfirm, productName }) {
  if (!open) return null
  return (
    <div className="prod-modal-root" role="presentation">
      <button type="button" className="prod-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="prod-modal" role="dialog" aria-modal="true">
        <h3>Deactivate product?</h3>
        <p>
          {productName ? `"${productName}" will be hidden from the storefront.` : 'This product will be hidden from the storefront.'}
        </p>
        <div className="prod-modal__actions">
          <button type="button" className="prod-btn prod-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="prod-btn prod-btn--danger" onClick={onConfirm}>
            <Trash2 size={16} /> Deactivate
          </button>
        </div>
      </div>
    </div>
  )
}
