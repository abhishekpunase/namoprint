import {
  Archive,
  Download,
  Printer,
  RefreshCw,
  Tag,
  UserPlus,
} from 'lucide-react'

export function OrderBulkActionsBar({
  selectedCount,
  onExport,
  onPrint,
  onStatusUpdate,
  onRefresh,
  refreshing,
}) {
  if (!selectedCount) return null

  return (
    <div className="ord-bulk-bar" role="toolbar" aria-label="Bulk actions">
      <strong>{selectedCount} selected</strong>
      <button type="button" className="ord-btn ord-btn--ghost" onClick={onStatusUpdate}>
        <Tag size={16} /> Update Status
      </button>
      <button type="button" className="ord-btn ord-btn--ghost" onClick={onExport}>
        <Download size={16} /> Export
      </button>
      <button type="button" className="ord-btn ord-btn--ghost" onClick={onPrint}>
        <Printer size={16} /> Print
      </button>
      <button type="button" className="ord-btn ord-btn--ghost" disabled title="TODO: bulk label API">
        <Archive size={16} /> Labels (TODO)
      </button>
      <button type="button" className="ord-btn ord-btn--ghost" disabled title="TODO: staff assignment API">
        <UserPlus size={16} /> Assign Staff (TODO)
      </button>
      <button type="button" className="ord-btn ord-btn--ghost" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw size={16} className={refreshing ? 'is-spinning' : ''} /> Refresh
      </button>
    </div>
  )
}

export function OrderListToolbar({
  total,
  density,
  onDensityChange,
  onRefresh,
  onExportCsv,
  onExportExcel,
  onPrint,
  refreshing,
  visibleColumns,
  onToggleColumn,
}) {
  const columns = [
    { id: 'orderNo', label: 'Order' },
    { id: 'customer', label: 'Customer' },
    { id: 'products', label: 'Products' },
    { id: 'items', label: 'Items' },
    { id: 'date', label: 'Date' },
    { id: 'paymentMethod', label: 'Payment Method' },
    { id: 'paymentStatus', label: 'Payment' },
    { id: 'shippingStatus', label: 'Shipping' },
    { id: 'orderStatus', label: 'Status' },
    { id: 'coupon', label: 'Coupon' },
    { id: 'total', label: 'Total' },
    { id: 'staff', label: 'Staff' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'actions', label: 'Actions' },
  ]

  return (
    <div className="ord-toolbar">
      <div>
        <h2>All Orders</h2>
        <p>{total} orders</p>
      </div>
      <div className="ord-toolbar__actions">
        <div className="ord-density" role="group" aria-label="Table density">
          <button type="button" className={`ord-btn ord-btn--ghost ${density === 'compact' ? 'is-active' : ''}`} onClick={() => onDensityChange('compact')}>
            Compact
          </button>
          <button type="button" className={`ord-btn ord-btn--ghost ${density === 'comfortable' ? 'is-active' : ''}`} onClick={() => onDensityChange('comfortable')}>
            Comfortable
          </button>
        </div>
        <button type="button" className="ord-btn ord-btn--ghost" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'is-spinning' : ''} /> Refresh
        </button>
        <button type="button" className="ord-btn ord-btn--ghost" onClick={onExportCsv}>
          <Download size={16} /> CSV
        </button>
        <button type="button" className="ord-btn ord-btn--ghost" onClick={onExportExcel}>
          <Download size={16} /> Excel
        </button>
        <button type="button" className="ord-btn ord-btn--ghost" onClick={onPrint}>
          <Printer size={16} /> Print
        </button>
        <details className="ord-column-picker">
          <summary>Columns</summary>
          <div className="ord-column-picker__menu">
            {columns.map((col) => (
              <label key={col.id}>
                <input type="checkbox" checked={visibleColumns.includes(col.id)} onChange={() => onToggleColumn(col.id)} />
                {col.label}
              </label>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}

export function StatusUpdateModal({ open, title, statuses, value, onChange, note, onNoteChange, onClose, onConfirm, saving }) {
  if (!open) return null

  return (
    <div className="ord-modal-root" role="dialog" aria-modal="true">
      <button type="button" className="ord-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="ord-modal">
        <h3>{title}</h3>
        <label>
          Status
          <select value={value} onChange={(e) => onChange(e.target.value)}>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Note
          <textarea value={note} onChange={(e) => onNoteChange(e.target.value)} rows={3} placeholder="Optional note for timeline" />
        </label>
        <div className="ord-modal__actions">
          <button type="button" className="ord-btn ord-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="ord-btn ord-btn--primary" onClick={onConfirm} disabled={saving}>
            {saving ? 'Updating…' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function RefundModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="ord-modal-root" role="dialog" aria-modal="true">
      <button type="button" className="ord-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="ord-modal">
        <h3>Refund Order</h3>
        <p className="ord-todo">Partial/full refund requires payment gateway API — TODO placeholder.</p>
        <div className="ord-modal__actions">
          <button type="button" className="ord-btn ord-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
