import { STOCK_STATUSES } from '../../../utils/inventoryAdminUtils'

export function InventorySearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      className="inv-search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <input
        placeholder="Search product, SKU, barcode, category, warehouse…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </form>
  )
}

export function InventoryFilters({ filters, onChange, options, onClear }) {
  return (
    <div className="inv-filters">
      <label>
        Stock Status
        <select value={filters.stockStatus} onChange={(e) => onChange({ ...filters, stockStatus: e.target.value })}>
          {STOCK_STATUSES.map((s) => (
            <option key={s.value || 'all'} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>
      <label>
        Warehouse
        <select value={filters.warehouse} onChange={(e) => onChange({ ...filters, warehouse: e.target.value })}>
          <option value="">All warehouses</option>
          {options.warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </label>
      <label>
        Category
        <select value={filters.category} onChange={(e) => onChange({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {options.categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Brand
        <select value={filters.brand} onChange={(e) => onChange({ ...filters, brand: e.target.value })}>
          <option value="">All brands</option>
          {options.brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>
      <label>
        Reserved
        <select value={filters.reserved} onChange={(e) => onChange({ ...filters, reserved: e.target.value })}>
          <option value="">Any</option>
          <option value="yes">Has reserved</option>
          <option value="no">No reserved</option>
        </select>
      </label>
      <button type="button" className="inv-btn inv-btn--ghost" onClick={onClear}>Clear filters</button>
    </div>
  )
}

export function InventoryToolbar({
  total,
  selectedCount,
  density,
  onDensityChange,
  onRefresh,
  refreshing,
  onExportCsv,
  onExportExcel,
  onPrint,
  onImport,
  onReports,
  onAdjust,
  visibleColumns,
  onToggleColumn,
  onBulkUpdate,
}) {
  const columns = [
    { id: 'image', label: 'Image' },
    { id: 'name', label: 'Product' },
    { id: 'sku', label: 'SKU' },
    { id: 'barcode', label: 'Barcode' },
    { id: 'category', label: 'Category' },
    { id: 'warehouse', label: 'Warehouse' },
    { id: 'current', label: 'Current' },
    { id: 'reserved', label: 'Reserved' },
    { id: 'available', label: 'Available' },
    { id: 'incoming', label: 'Incoming' },
    { id: 'min', label: 'Min' },
    { id: 'max', label: 'Max' },
    { id: 'status', label: 'Status' },
    { id: 'updated', label: 'Updated' },
    { id: 'actions', label: 'Actions' },
  ]

  return (
    <>
      {selectedCount > 0 ? (
        <div className="inv-bulk-bar">
          <strong>{selectedCount} selected</strong>
          <button type="button" className="inv-btn inv-btn--ghost" onClick={onBulkUpdate} disabled title="TODO: bulk stock API loop">Bulk Update (TODO)</button>
          <button type="button" className="inv-btn inv-btn--ghost" onClick={onExportCsv}>Export Selected</button>
        </div>
      ) : null}
      <div className="inv-toolbar">
        <div>
          <h2>Inventory Items</h2>
          <p>{total} variant rows</p>
        </div>
        <div className="inv-toolbar__actions">
          <div className="inv-density">
            <button type="button" className={`inv-btn inv-btn--ghost ${density === 'compact' ? 'is-active' : ''}`} onClick={() => onDensityChange('compact')}>Compact</button>
            <button type="button" className={`inv-btn inv-btn--ghost ${density === 'comfortable' ? 'is-active' : ''}`} onClick={() => onDensityChange('comfortable')}>Comfortable</button>
          </div>
          <button type="button" className="inv-btn inv-btn--primary" onClick={onAdjust}>Stock Adjustment</button>
          <button type="button" className="inv-btn inv-btn--ghost" onClick={onReports}>Reports</button>
          <button type="button" className="inv-btn inv-btn--ghost" onClick={onImport} disabled title="TODO">Import (TODO)</button>
          <button type="button" className="inv-btn inv-btn--ghost" onClick={onRefresh} disabled={refreshing}>Refresh</button>
          <button type="button" className="inv-btn inv-btn--ghost" onClick={onExportCsv}>CSV</button>
          <button type="button" className="inv-btn inv-btn--ghost" onClick={onExportExcel}>Excel</button>
          <button type="button" className="inv-btn inv-btn--ghost" onClick={onPrint}>Print</button>
          <details className="inv-column-picker">
            <summary>Columns</summary>
            <div className="inv-column-picker__menu">
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
    </>
  )
}

export function InventoryPagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="inv-pagination">
      <label>
        Rows
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[15, 25, 50, 100].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <div className="inv-pagination__nav">
        <button type="button" className="inv-btn inv-btn--ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="inv-btn inv-btn--ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </div>
  )
}
