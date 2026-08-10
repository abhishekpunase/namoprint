import { Download, Printer, RefreshCw, Shield } from 'lucide-react'
import { AUDIT_ACTIONS, formatAuditDate } from '../../../utils/systemAdminUtils'

export function AuditKpiCards({ security, health, loading }) {
  if (loading) {
    return (
      <div className="sys-dashboard">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="sys-stat-card sys-skeleton" />)}
      </div>
    )
  }

  const cards = [
    { label: 'Audit Events', value: 'Live' },
    { label: 'Failed Logins', value: security?.failedLogins ?? 0 },
    { label: 'Active Sessions', value: security?.activeSessions ?? 0 },
    { label: 'System Status', value: health?.overall ?? '—' },
    { label: 'API Latency', value: health?.api?.latency ? `${health.api.latency}ms` : '—' },
    { label: 'JWT Status', value: security?.jwtStatus ?? '—' },
  ]

  return (
    <div className="sys-dashboard">
      {cards.map((c) => (
        <article key={c.label} className="sys-stat-card">
          <span>{c.label}</span>
          <strong>{c.value}</strong>
        </article>
      ))}
    </div>
  )
}

export function AuditLogTable({ logs, selected, onToggleSelect, loading }) {
  if (loading) {
    return <div className="sys-skeleton" style={{ minHeight: 240 }} />
  }

  if (!logs.length) {
    return (
      <div className="sys-empty">
        <Shield size={32} />
        <p>No audit logs match your filters</p>
      </div>
    )
  }

  return (
    <>
      <div className="sys-table-wrap">
        <table className="sys-table">
          <thead>
            <tr>
              <th><input type="checkbox" aria-label="Select all" onChange={() => {}} /></th>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Detail</th>
              <th>Status</th>
              <th>Browser</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="sys-table__row">
                <td><input type="checkbox" checked={selected.includes(log.id)} onChange={() => onToggleSelect(log.id)} /></td>
                <td>{formatAuditDate(log.timestamp)}</td>
                <td>{log.user}</td>
                <td><span className="sys-badge">{log.action}</span></td>
                <td>{log.resource}</td>
                <td>{log.detail}</td>
                <td><span className={`sys-status sys-status--${log.status}`}>{log.status}</span></td>
                <td>{log.browser}</td>
                <td>{log.device}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sys-cards--mobile">
        {logs.map((log) => (
          <article key={log.id} className="sys-card-row">
            <div className="sys-card-row__head">
              <strong>{log.action}</strong>
              <span className={`sys-status sys-status--${log.status}`}>{log.status}</span>
            </div>
            <p>{log.detail}</p>
            <small>{log.user} · {formatAuditDate(log.timestamp)}</small>
          </article>
        ))}
      </div>
    </>
  )
}

export function AuditFilters({ filters, onChange, search, onSearchChange, onRefresh, refreshing, onExport, onPrint }) {
  return (
    <div className="sys-filters">
      <label className="sys-search">
        <input type="search" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search user, action, IP…" />
      </label>
      <label>
        Action
        <select value={filters.action} onChange={(e) => onChange({ ...filters, action: e.target.value })}>
          {AUDIT_ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </label>
      <label>
        Resource
        <select value={filters.resource} onChange={(e) => onChange({ ...filters, resource: e.target.value })}>
          <option value="">All resources</option>
          {['auth', 'product', 'order', 'category', 'customer', 'coupon', 'settings', 'backup', 'notification'].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
          <option value="">All</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </label>
      <label>
        From
        <input type="date" value={filters.dateFrom} onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })} />
      </label>
      <label>
        To
        <input type="date" value={filters.dateTo} onChange={(e) => onChange({ ...filters, dateTo: e.target.value })} />
      </label>
      <button type="button" className="sys-btn sys-btn--ghost" onClick={onRefresh} disabled={refreshing}><RefreshCw size={16} /> Refresh</button>
      <button type="button" className="sys-btn sys-btn--ghost" onClick={onExport}><Download size={16} /> CSV</button>
      <button type="button" className="sys-btn sys-btn--ghost" onClick={onPrint}><Printer size={16} /> Print</button>
    </div>
  )
}
