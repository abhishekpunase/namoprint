import { Link } from 'react-router-dom'
import { Copy, Eye, MoreHorizontal, Power, PowerOff, Ticket } from 'lucide-react'
import { formatCustomerDate } from '../../../utils/customerAdminUtils'
import { CouponStatusBadge } from './CouponStatusBadge'

export function CouponTableSkeleton() {
  return <div className="cpn-skeleton cpn-skeleton--table" />
}

export function CouponTable({
  rows,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  visibleColumns,
  sortKey,
  sortDir,
  onSort,
  onDisable,
  onEnable,
  onDuplicate,
  onArchive,
}) {
  const show = (col) => visibleColumns.includes(col)
  const SortBtn = ({ col, label }) => (
    <button type="button" className="cpn-sort-btn" onClick={() => onSort(col)}>
      {label} {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  )

  if (!rows.length) {
    return (
      <div className="cpn-empty">
        <Ticket size={32} />
        <p>No coupons match your filters</p>
        <Link to="/admin/coupons/new" className="cpn-btn cpn-btn--primary">Create Coupon</Link>
      </div>
    )
  }

  const encodeCode = (code) => encodeURIComponent(code)

  return (
    <>
      <div className="cpn-table-wrap">
        <table className="cpn-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} aria-label="Select all" /></th>
              {show('code') && <th><SortBtn col="code" label="Code" /></th>}
              {show('name') && <th><SortBtn col="name" label="Name" /></th>}
              {show('type') && <th>Type</th>}
              {show('value') && <th><SortBtn col="value" label="Value" /></th>}
              {show('usage') && <th><SortBtn col="usage" label="Usage" /></th>}
              {show('maxUsage') && <th>Max Usage</th>}
              {show('status') && <th><SortBtn col="status" label="Status" /></th>}
              {show('startDate') && <th>Start Date</th>}
              {show('expiryDate') && <th>Expiry</th>}
              {show('appliesTo') && <th>Applies To</th>}
              {show('updated') && <th>Last Updated</th>}
              {show('actions') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} className="cpn-table__row">
                <td><input type="checkbox" checked={selected.includes(row.code)} onChange={() => onToggleSelect(row.code)} /></td>
                {show('code') && (
                  <td>
                    <Link to={`/admin/coupons/${encodeCode(row.code)}`} className="cpn-code">{row.code}</Link>
                    {row.source === 'local' ? <span className="cpn-source-tag">Draft</span> : null}
                    {row.isBackend ? <span className="cpn-source-tag">Live</span> : null}
                  </td>
                )}
                {show('name') && <td><strong>{row.name}</strong></td>}
                {show('type') && <td>{row.discountTypeLabel}</td>}
                {show('value') && <td>{row.discountValueLabel}</td>}
                {show('usage') && <td><strong>{row.usageCount}</strong></td>}
                {show('maxUsage') && <td>{row.maxUsage ?? '∞'}</td>}
                {show('status') && <td><CouponStatusBadge status={row.status} /></td>}
                {show('startDate') && <td>{row.startDate ? formatCustomerDate(row.startDate) : '—'}</td>}
                {show('expiryDate') && <td>{row.expiryDate ? formatCustomerDate(row.expiryDate) : '—'}</td>}
                {show('appliesTo') && <td>{row.appliesTo}</td>}
                {show('updated') && <td>{formatCustomerDate(row.lastUpdated)}</td>}
                {show('actions') && (
                  <td>
                    <div className="cpn-row-actions">
                      <Link to={`/admin/coupons/${encodeCode(row.code)}`} className="cpn-icon-btn" title="View"><Eye size={16} /></Link>
                      <Link to={`/admin/coupons/${encodeCode(row.code)}/edit`} className="cpn-icon-btn" title="Edit"><MoreHorizontal size={16} /></Link>
                      <button type="button" className="cpn-icon-btn" title="Duplicate" onClick={() => onDuplicate(row)}><Copy size={16} /></button>
                      {row.status === 'disabled' ? (
                        <button type="button" className="cpn-icon-btn" title="Enable" onClick={() => onEnable(row.code)}><Power size={16} /></button>
                      ) : (
                        <button type="button" className="cpn-icon-btn" title="Disable" onClick={() => onDisable(row.code)}><PowerOff size={16} /></button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cpn-cards--mobile">
        {rows.map((row) => (
          <article key={row.code} className="cpn-card">
            <div className="cpn-card__head">
              <div>
                <Link to={`/admin/coupons/${encodeCode(row.code)}`} className="cpn-code">{row.code}</Link>
                <p><strong>{row.name}</strong></p>
              </div>
              <CouponStatusBadge status={row.status} />
            </div>
            <div className="cpn-card__meta">
              <span>{row.discountTypeLabel}</span>
              <span>{row.discountValueLabel}</span>
              <span>Used {row.usageCount}x</span>
            </div>
            <div className="cpn-row-actions">
              <Link to={`/admin/coupons/${encodeCode(row.code)}`} className="cpn-btn cpn-btn--ghost">View</Link>
              <Link to={`/admin/coupons/${encodeCode(row.code)}/edit`} className="cpn-btn cpn-btn--ghost">Edit</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
