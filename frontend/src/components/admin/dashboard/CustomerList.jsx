import { Link } from 'react-router-dom'
import { UserCircle } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Loader'

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : '—'

export function CustomerList({ customers = [], loading = false }) {
  if (loading) {
    return (
      <section className="dash-panel">
        <Skeleton className="dash-table-skeleton" />
      </section>
    )
  }

  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <h2>Latest Customers</h2>
          <p>Recently registered store customers</p>
        </div>
      </div>

      {!customers.length ? (
        <EmptyState title="No customers yet" description="New customer registrations will show up here." />
      ) : (
        <ul className="dash-customer-list">
          {customers.map((customer) => (
            <li key={customer._id} className="dash-customer-list__item">
              <div className="dash-customer-list__avatar" aria-hidden="true">
                {(customer.name || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="dash-customer-list__meta">
                <strong>{customer.name}</strong>
                <small>{customer.email}</small>
                <small>{customer.phone || '—'}</small>
              </div>
              <div className="dash-customer-list__stats">
                <span>Joined {formatDate(customer.createdAt)}</span>
                <span>Role: {customer.role}</span>
              </div>
              <Link className="dash-link-btn" to="/admin/users">
                <UserCircle size={16} /> View Profile
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
