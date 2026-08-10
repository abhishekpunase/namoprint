import { Download, Mail, Printer, RefreshCw, ShieldBan, ShieldCheck, Upload } from 'lucide-react'
import { CUSTOMER_SEGMENTS } from '../../../utils/customerAdminUtils'

export function CustomerAnalyticsBar({ analytics }) {
  return (
    <div className="crm-analytics">
      <div className="crm-analytics__card"><span>Total Customers</span><strong>{analytics.total}</strong></div>
      <div className="crm-analytics__card"><span>Active</span><strong>{analytics.active}</strong></div>
      <div className="crm-analytics__card"><span>VIP</span><strong>{analytics.vip}</strong></div>
      <div className="crm-analytics__card"><span>Total Orders</span><strong>{analytics.totalOrders}</strong></div>
      <div className="crm-analytics__card"><span>Combined LTV</span><strong>₹{Math.round(analytics.revenue).toLocaleString('en-IN')}</strong></div>
    </div>
  )
}

export function CustomerSearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      className="crm-search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <input
        placeholder="Search name, email, phone, ID, city, country…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </form>
  )
}

export function CustomerFilters({ filters, onChange, locations, onClear }) {
  return (
    <div className="crm-filters">
      <label>
        Segment
        <select value={filters.segment} onChange={(e) => onChange({ ...filters, segment: e.target.value })}>
          {CUSTOMER_SEGMENTS.map((s) => (
            <option key={s.value || 'all'} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="disabled">Blocked</option>
        </select>
      </label>
      <label>
        Country
        <select value={filters.country} onChange={(e) => onChange({ ...filters, country: e.target.value })}>
          <option value="">All countries</option>
          {locations.countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        State
        <select value={filters.state} onChange={(e) => onChange({ ...filters, state: e.target.value })}>
          <option value="">All states</option>
          {locations.states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        City
        <select value={filters.city} onChange={(e) => onChange({ ...filters, city: e.target.value })}>
          <option value="">All cities</option>
          {locations.cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Registered from
        <input type="date" value={filters.dateFrom} onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })} />
      </label>
      <label>
        Registered to
        <input type="date" value={filters.dateTo} onChange={(e) => onChange({ ...filters, dateTo: e.target.value })} />
      </label>
      <label>
        Min orders
        <input type="number" min={0} value={filters.ordersMin} onChange={(e) => onChange({ ...filters, ordersMin: e.target.value })} />
      </label>
      <label>
        Min LTV (₹)
        <input type="number" min={0} value={filters.ltvMin} onChange={(e) => onChange({ ...filters, ltvMin: e.target.value })} />
      </label>
      <button type="button" className="crm-btn crm-btn--ghost" onClick={onClear}>Clear filters</button>
    </div>
  )
}

export function CustomerListToolbar({
  total,
  selectedCount,
  onRefresh,
  refreshing,
  onExportCsv,
  onExportExcel,
  onPrint,
  onImport,
  onBulkBlock,
  onBulkUnblock,
  onBulkEmail,
  visibleColumns,
  onToggleColumn,
}) {
  const columns = [
    { id: 'avatar', label: 'Avatar' },
    { id: 'name', label: 'Name' },
    { id: 'id', label: 'Customer ID' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'country', label: 'Country' },
    { id: 'city', label: 'City' },
    { id: 'orders', label: 'Orders' },
    { id: 'ltv', label: 'Lifetime Value' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'status', label: 'Status' },
    { id: 'registered', label: 'Registered' },
    { id: 'lastLogin', label: 'Last Login' },
    { id: 'actions', label: 'Actions' },
  ]

  return (
    <>
      {selectedCount > 0 ? (
        <div className="crm-bulk-bar" role="toolbar">
          <strong>{selectedCount} selected</strong>
          <button type="button" className="crm-btn crm-btn--ghost" onClick={onBulkBlock}><ShieldBan size={16} /> Block</button>
          <button type="button" className="crm-btn crm-btn--ghost" onClick={onBulkUnblock}><ShieldCheck size={16} /> Unblock</button>
          <button type="button" className="crm-btn crm-btn--ghost" onClick={onBulkEmail} disabled title="TODO: bulk email API"><Mail size={16} /> Email (TODO)</button>
          <button type="button" className="crm-btn crm-btn--ghost" onClick={onExportCsv}><Download size={16} /> Export Selected</button>
        </div>
      ) : null}
      <div className="crm-toolbar">
        <div>
          <h2>All Customers</h2>
          <p>{total} storefront customers</p>
        </div>
        <div className="crm-toolbar__actions">
          <button type="button" className="crm-btn crm-btn--ghost" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'is-spinning' : ''} /> Refresh
          </button>
          <button type="button" className="crm-btn crm-btn--ghost" onClick={onImport} disabled title="TODO: import API"><Upload size={16} /> Import (TODO)</button>
          <button type="button" className="crm-btn crm-btn--ghost" onClick={onExportCsv}><Download size={16} /> CSV</button>
          <button type="button" className="crm-btn crm-btn--ghost" onClick={onExportExcel}><Download size={16} /> Excel</button>
          <button type="button" className="crm-btn crm-btn--ghost" onClick={onPrint}><Printer size={16} /> Print</button>
          <details className="crm-column-picker">
            <summary>Columns</summary>
            <div className="crm-column-picker__menu">
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

export function CustomerPagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="crm-pagination">
      <label>
        Rows
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <div className="crm-pagination__nav">
        <button type="button" className="crm-btn crm-btn--ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="crm-btn crm-btn--ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </div>
  )
}
