import { COUPON_STATUSES, DISCOUNT_TYPES } from '../../../utils/couponAdminUtils'

export function CouponSearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      className="cpn-search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <input
        placeholder="Search code, name, type, product, category…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </form>
  )
}

export function CouponFilters({ filters, onChange, onClear }) {
  return (
    <div className="cpn-filters">
      <label>
        Status
        <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
          {COUPON_STATUSES.map((s) => (
            <option key={s.value || 'all'} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>
      <label>
        Discount Type
        <select value={filters.type} onChange={(e) => onChange({ ...filters, type: e.target.value })}>
          <option value="">All types</option>
          {DISCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}{t.todo ? ' (TODO)' : ''}</option>
          ))}
        </select>
      </label>
      <label>
        Application
        <select value={filters.automatic} onChange={(e) => onChange({ ...filters, automatic: e.target.value })}>
          <option value="">All</option>
          <option value="yes">Automatic</option>
          <option value="no">Manual</option>
        </select>
      </label>
      <label>
        Source
        <select value={filters.source} onChange={(e) => onChange({ ...filters, source: e.target.value })}>
          <option value="">All sources</option>
          <option value="backend">Backend (live)</option>
          <option value="local">Local drafts</option>
        </select>
      </label>
      <button type="button" className="cpn-btn cpn-btn--ghost" onClick={onClear}>Clear filters</button>
    </div>
  )
}

const COLUMN_OPTIONS = [
  { id: 'code', label: 'Code' },
  { id: 'name', label: 'Name' },
  { id: 'type', label: 'Type' },
  { id: 'value', label: 'Value' },
  { id: 'usage', label: 'Usage' },
  { id: 'maxUsage', label: 'Max Usage' },
  { id: 'status', label: 'Status' },
  { id: 'startDate', label: 'Start Date' },
  { id: 'expiryDate', label: 'Expiry' },
  { id: 'appliesTo', label: 'Applies To' },
  { id: 'updated', label: 'Updated' },
  { id: 'actions', label: 'Actions' },
]

export function CouponToolbar({
  total,
  selectedCount,
  onRefresh,
  refreshing,
  onExportCsv,
  onExportExcel,
  onPrint,
  onImport,
  visibleColumns,
  onToggleColumn,
  onBulkEnable,
  onBulkDisable,
  onBulkExport,
}) {
  return (
    <>
      {selectedCount > 0 ? (
        <div className="cpn-bulk-bar">
          <strong>{selectedCount} selected</strong>
          <button type="button" className="cpn-btn cpn-btn--ghost" onClick={onBulkEnable}>Bulk Activate</button>
          <button type="button" className="cpn-btn cpn-btn--ghost" onClick={onBulkDisable}>Bulk Disable</button>
          <button type="button" className="cpn-btn cpn-btn--ghost" onClick={onBulkExport}>Bulk Export</button>
        </div>
      ) : null}
      <div className="cpn-toolbar">
        <div>
          <h2>Coupons & Promotions</h2>
          <p>{total} coupons</p>
        </div>
        <div className="cpn-toolbar__actions">
          <button type="button" className="cpn-btn cpn-btn--ghost" onClick={onImport}>Import</button>
          <button type="button" className="cpn-btn cpn-btn--ghost" onClick={onRefresh} disabled={refreshing}>Refresh</button>
          <button type="button" className="cpn-btn cpn-btn--ghost" onClick={onExportCsv}>CSV</button>
          <button type="button" className="cpn-btn cpn-btn--ghost" onClick={onExportExcel}>Excel</button>
          <button type="button" className="cpn-btn cpn-btn--ghost" onClick={onPrint}>Print</button>
          <details className="cpn-column-picker">
            <summary>Columns</summary>
            <div className="cpn-column-picker__menu">
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

export function CouponPagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="cpn-pagination">
      <label>
        Rows per page
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <div className="cpn-pagination__nav">
        <button type="button" className="cpn-btn cpn-btn--ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="cpn-btn cpn-btn--ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </div>
  )
}
