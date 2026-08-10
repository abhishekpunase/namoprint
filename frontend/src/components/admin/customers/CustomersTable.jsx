import { Link } from 'react-router-dom'
import { Eye, Mail, ShieldBan, ShieldCheck, Star } from 'lucide-react'
import { formatCurrency } from '../../../utils/format'
import { formatCustomerDate, getCustomerId, getCustomerInitials } from '../../../utils/customerAdminUtils'

export function CustomersTable({
  customers,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  visibleColumns,
  sortKey,
  sortDir,
  onSort,
  onToggleBlock,
  onMarkVip,
}) {
  const show = (col) => visibleColumns.includes(col)

  const SortBtn = ({ col, label }) => (
    <button type="button" className="crm-sort-btn" onClick={() => onSort(col)}>
      {label} {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  )

  if (!customers.length) {
    return (
      <div className="crm-empty">
        <p>No customers found</p>
        <small>Try adjusting search or filters.</small>
      </div>
    )
  }

  return (
    <>
      <div className="crm-table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} aria-label="Select all" /></th>
              {show('avatar') && <th>Avatar</th>}
              {show('name') && <th><SortBtn col="name" label="Name" /></th>}
              {show('id') && <th>Customer ID</th>}
              {show('email') && <th><SortBtn col="email" label="Email" /></th>}
              {show('phone') && <th>Phone</th>}
              {show('country') && <th><SortBtn col="country" label="Country" /></th>}
              {show('city') && <th><SortBtn col="city" label="City" /></th>}
              {show('orders') && <th><SortBtn col="orders" label="Orders" /></th>}
              {show('ltv') && <th><SortBtn col="ltv" label="LTV" /></th>}
              {show('wishlist') && <th>Wishlist</th>}
              {show('status') && <th>Status</th>}
              {show('registered') && <th><SortBtn col="createdAt" label="Registered" /></th>}
              {show('lastLogin') && <th>Last Login</th>}
              {show('actions') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const id = getCustomerId(customer)
              return (
                <tr key={id} className="crm-table__row">
                  <td><input type="checkbox" checked={selected.includes(id)} onChange={() => onToggleSelect(id)} /></td>
                  {show('avatar') && (
                    <td>
                      <span className="crm-avatar">{getCustomerInitials(customer.name)}</span>
                    </td>
                  )}
                  {show('name') && (
                    <td>
                      <Link to={`/admin/customers/${id}`} className="crm-name-link">
                        <strong>{customer.name}</strong>
                        {customer.meta?.vip ? <Star size={14} className="crm-vip-icon" title="VIP" /> : null}
                      </Link>
                    </td>
                  )}
                  {show('id') && <td><code className="crm-id">{String(id).slice(-8)}</code></td>}
                  {show('email') && <td>{customer.email}</td>}
                  {show('phone') && <td>{customer.phone || '—'}</td>}
                  {show('country') && <td>{customer.location?.country || '—'}</td>}
                  {show('city') && <td>{customer.location?.city || '—'}</td>}
                  {show('orders') && <td>{customer.stats?.totalOrders || 0}</td>}
                  {show('ltv') && <td>{formatCurrency(customer.stats?.lifetimeValue || 0)}</td>}
                  {show('wishlist') && <td className="crm-todo-cell" title="TODO: wishlist API">—</td>}
                  {show('status') && (
                    <td>
                      <span className={`crm-status ${customer.isActive !== false ? 'is-active' : 'is-blocked'}`}>
                        {customer.isActive !== false ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                  )}
                  {show('registered') && <td>{formatCustomerDate(customer.createdAt)}</td>}
                  {show('lastLogin') && <td>{formatCustomerDate(customer.meta?.lastLogin)}</td>}
                  {show('actions') && (
                    <td>
                      <div className="crm-row-actions">
                        <Link to={`/admin/customers/${id}`} className="crm-icon-btn" title="View"><Eye size={16} /></Link>
                        <button type="button" className="crm-icon-btn" title="Email (TODO)" disabled><Mail size={16} /></button>
                        <button type="button" className="crm-icon-btn" title={customer.meta?.vip ? 'Remove VIP' : 'Mark VIP'} onClick={() => onMarkVip(id, !customer.meta?.vip)}>
                          <Star size={16} />
                        </button>
                        <button type="button" className="crm-icon-btn" title={customer.isActive !== false ? 'Block' : 'Unblock'} onClick={() => onToggleBlock(customer)}>
                          {customer.isActive !== false ? <ShieldBan size={16} /> : <ShieldCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="crm-cards--mobile">
        {customers.map((customer) => {
          const id = getCustomerId(customer)
          return (
            <article key={id} className="crm-card">
              <div className="crm-card__head">
                <span className="crm-avatar">{getCustomerInitials(customer.name)}</span>
                <div>
                  <Link to={`/admin/customers/${id}`}><strong>{customer.name}</strong></Link>
                  <p>{customer.email}</p>
                </div>
                <span className={`crm-status ${customer.isActive !== false ? 'is-active' : 'is-blocked'}`}>
                  {customer.isActive !== false ? 'Active' : 'Blocked'}
                </span>
              </div>
              <div className="crm-card__meta">
                <span>{customer.stats?.totalOrders || 0} orders</span>
                <span>{formatCurrency(customer.stats?.lifetimeValue || 0)}</span>
                <span>{customer.location?.city || '—'}</span>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

export function CustomerTableSkeleton() {
  return <div className="crm-skeleton crm-skeleton--table" aria-hidden="true" />
}

export function CustomerProfileSkeleton() {
  return <div className="crm-skeleton crm-skeleton--profile" aria-hidden="true" />
}
