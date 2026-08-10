import { Download, Eye, Printer, RefreshCw, UserPlus } from 'lucide-react'

export function UserListToolbar({
  total,
  onRefresh,
  refreshing,
  onExportCsv,
  onExportExcel,
  onPrint,
  visibleColumns,
  onToggleColumn,
  onAddUser,
}) {
  const columns = [
    { id: 'avatar', label: 'Avatar' },
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'role', label: 'Role' },
    { id: 'department', label: 'Department' },
    { id: 'status', label: 'Status' },
    { id: 'lastLogin', label: 'Last Login' },
    { id: 'createdAt', label: 'Created' },
    { id: 'actions', label: 'Actions' },
  ]

  return (
    <div className="usr-toolbar">
      <div>
        <h2>All Users</h2>
        <p>{total} users</p>
      </div>
      <div className="usr-toolbar__actions">
        <button type="button" className="usr-btn usr-btn--primary" onClick={onAddUser} disabled title="TODO: POST /admin/users API">
          <UserPlus size={16} /> Add User (TODO)
        </button>
        <button type="button" className="usr-btn usr-btn--ghost" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'is-spinning' : ''} /> Refresh
        </button>
        <button type="button" className="usr-btn usr-btn--ghost" onClick={onExportCsv}><Download size={16} /> CSV</button>
        <button type="button" className="usr-btn usr-btn--ghost" onClick={onExportExcel}><Download size={16} /> Excel</button>
        <button type="button" className="usr-btn usr-btn--ghost" onClick={onPrint}><Printer size={16} /> Print</button>
        <details className="usr-column-picker">
          <summary>Columns</summary>
          <div className="usr-column-picker__menu">
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

export function UserSearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      className="usr-search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <input placeholder="Search name, email, phone, role…" value={value} onChange={(e) => onChange(e.target.value)} />
    </form>
  )
}

export function UserFilters({ filters, onChange, departments, onClear }) {
  return (
    <div className="usr-filters">
      <label>
        Role
        <select value={filters.role} onChange={(e) => onChange({ ...filters, role: e.target.value })}>
          <option value="">All roles</option>
          <option value="admin">Administrator</option>
          <option value="customer">Customer</option>
        </select>
      </label>
      <label>
        Status
        <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </label>
      <label>
        Department
        <select value={filters.department} onChange={(e) => onChange({ ...filters, department: e.target.value })}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>
      <button type="button" className="usr-btn usr-btn--ghost" onClick={onClear}>Clear filters</button>
    </div>
  )
}

export function UserPagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="usr-pagination">
      <label>
        Rows
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <div className="usr-pagination__nav">
        <button type="button" className="usr-btn usr-btn--ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="usr-btn usr-btn--ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </div>
  )
}
