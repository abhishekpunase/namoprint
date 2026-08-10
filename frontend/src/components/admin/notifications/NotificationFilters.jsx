import { NOTIFICATION_TABS, NOTIFICATION_TYPES, PRIORITY_LEVELS } from '../../../utils/notificationAdminUtils'

export function NotificationSearchBar({ value, onChange }) {
  return (
    <label className="ntf-search">
      <span className="sr-only">Search notifications</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search recipient, title, type…"
      />
    </label>
  )
}

export function NotificationTabs({ active, onChange }) {
  return (
    <div className="ntf-tabs" role="tablist" aria-label="Notification filters">
      {NOTIFICATION_TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active === tab.value}
          className={`ntf-tab ${active === tab.value ? 'is-active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function MainSectionTabs({ active, onChange }) {
  const tabs = [
    { value: 'center', label: 'Notification Center' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'push', label: 'Push' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'automation', label: 'Automation' },
    { value: 'history', label: 'History' },
    { value: 'preferences', label: 'Preferences' },
  ]

  return (
    <div className="ntf-main-tabs" role="tablist" aria-label="Communication sections">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active === tab.value}
          className={`ntf-main-tab ${active === tab.value ? 'is-active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function NotificationFilters({ filters, onChange, onRefresh, refreshing }) {
  return (
    <div className="ntf-filters">
      <label>
        Type
        <select value={filters.type} onChange={(e) => onChange({ ...filters, type: e.target.value })}>
          {NOTIFICATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      <label>
        Priority
        <select value={filters.priority} onChange={(e) => onChange({ ...filters, priority: e.target.value })}>
          {PRIORITY_LEVELS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="delivered">Delivered</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </label>
      <button type="button" className="ntf-btn ntf-btn--ghost" onClick={onRefresh} disabled={refreshing}>
        {refreshing ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>
  )
}

export function BulkActionsBar({ selectedCount, onMarkRead, onExport, onClear }) {
  if (!selectedCount) return null

  return (
    <div className="ntf-bulk-bar">
      <strong>{selectedCount} selected</strong>
      <button type="button" className="ntf-btn ntf-btn--ghost ntf-btn--sm" onClick={onMarkRead}>Mark as read</button>
      <button type="button" className="ntf-btn ntf-btn--ghost ntf-btn--sm" onClick={onExport}>Export CSV</button>
      <button type="button" className="ntf-btn ntf-btn--ghost ntf-btn--sm" onClick={onClear}>Clear selection</button>
    </div>
  )
}

export function PaginationBar({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="ntf-pagination">
      <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted)' }}>
        {total} notification{total === 1 ? '' : 's'} · Page {page} of {totalPages}
      </span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} style={{ minHeight: 36, borderRadius: 8, border: '1px solid var(--admin-border)', padding: '0 8px' }}>
          {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button type="button" className="ntf-btn ntf-btn--ghost ntf-btn--sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <button type="button" className="ntf-btn ntf-btn--ghost ntf-btn--sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </div>
  )
}
