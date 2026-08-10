import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../utils/format'
import { StatusBadge } from '../ui/StatusBadge'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Loader'

const statusTone = (status = '') => {
  const value = status.toLowerCase()
  if (value.includes('cancel')) return 'danger'
  if (value.includes('refund')) return 'warning'
  if (value.includes('paid') || value.includes('deliver') || value.includes('complete')) return 'success'
  if (value.includes('pending')) return 'info'
  return 'neutral'
}

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : '—'

export function RecentOrdersTable({ orders = [], loading = false, search = '', onSearchChange }) {
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const pageSize = 5

  const sorted = useMemo(() => {
    const list = [...orders]
    list.sort((a, b) => {
      let left = a[sortKey]
      let right = b[sortKey]
      if (sortKey === 'date') {
        left = new Date(a.createdAt).getTime()
        right = new Date(b.createdAt).getTime()
      }
      if (sortKey === 'amount') {
        left = a.totals?.total || 0
        right = b.totals?.total || 0
      }
      if (sortKey === 'customer') {
        left = a.customer?.name || ''
        right = b.customer?.name || ''
      }
      if (sortKey === 'orderNo') {
        left = a.orderNo || ''
        right = b.orderNo || ''
      }
      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [orders, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

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
          <h2>Recent Orders</h2>
          <p>Latest transactions across your store</p>
        </div>
        <input
          type="search"
          className="dash-inline-search"
          placeholder="Search orders…"
          value={search}
          onChange={(event) => onSearchChange?.(event.target.value)}
          aria-label="Search recent orders"
        />
      </div>

      {!pageItems.length ? (
        <EmptyState title="No orders yet" description="Orders will appear here once customers checkout." />
      ) : (
        <>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>
                    <button type="button" onClick={() => toggleSort('orderNo')}>
                      Order ID
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => toggleSort('customer')}>
                      Customer
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => toggleSort('date')}>
                      Date
                    </button>
                  </th>
                  <th>Products</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>
                    <button type="button" onClick={() => toggleSort('amount')}>
                      Amount
                    </button>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNo}</td>
                    <td>
                      <strong>{order.customer?.name || '—'}</strong>
                      <small>{order.customer?.email || '—'}</small>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.items?.length || 0}</td>
                    <td>
                      <StatusBadge tone={order.payment?.status === 'Paid' ? 'success' : 'warning'}>
                        {order.payment?.status || 'Pending'}
                      </StatusBadge>
                    </td>
                    <td>
                      <StatusBadge tone={statusTone(order.status)}>{order.status}</StatusBadge>
                    </td>
                    <td>{formatCurrency(order.totals?.total || 0)}</td>
                    <td>
                      <Link className="dash-link-btn" to={`/admin/orders/${order._id}`} aria-label={`View order ${order.orderNo}`}>
                        <Eye size={16} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dash-table-foot">
            <button type="button" className="dash-btn dash-btn--ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="dash-btn dash-btn--ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  )
}
