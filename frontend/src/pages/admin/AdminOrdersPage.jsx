import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, RefreshCw, Search, X } from 'lucide-react'
import { useOrderList } from '../../hooks/useOrderList'
import { OrderAnalyticsBar, OrderPaymentMethod } from '../../components/admin/orders/OrderAnalytics'
import { OrderPagination } from '../../components/admin/orders/OrderTable'
import { OrderDetailsModal } from '../../components/admin/orders/OrderDetailsModal'
import { ORDER_STATUSES } from '../../utils/orderAdminUtils'
import { formatCurrency } from '../../utils/format'
import { Skeleton } from '../../components/admin/ui/Loader'

const formatOrderDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : '—'

function OrdersSimpleTable({ orders, loading, onStatusChange, onCancel, updatingId, onViewOrder }) {
  if (loading) {
    return (
      <div className="ord-table-wrap ord-table-wrap--simple">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="ord-table-skeleton-row" />
        ))}
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="ord-empty-simple">
        <p>No orders found.</p>
        <small>Orders from your store will appear here once customers checkout.</small>
      </div>
    )
  }

  return (
    <>
      <div className="ord-table-wrap ord-table-wrap--simple ord-table-wrap--desktop">
        <table className="ord-table ord-table--simple">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="ord-table__row">
                <td>
                  <Link to={`/admin/orders/${order._id}`} className="ord-name-link">
                    <strong>{order.orderNo}</strong>
                  </Link>
                </td>
                <td>
                  <div className="ord-customer-cell ord-customer-cell--simple">
                    <div>
                      <strong>{order.customer?.name || 'Guest'}</strong>
                      <small>{order.user ? 'Registered' : 'Guest'}</small>
                    </div>
                  </div>
                </td>
                <td><strong>{formatCurrency(order.totals?.total || 0)}</strong></td>
                <td><OrderPaymentMethod order={order} /></td>
                <td>{formatOrderDate(order.createdAt)}</td>
                <td>
                  <select
                    className={`ord-status-select ord-status-select--${(order.status || '').toLowerCase().replace(/\s+/g, '-')}`}
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => onStatusChange(order._id, e.target.value)}
                    aria-label={`Update status for ${order.orderNo}`}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="ord-row-actions">
                    <button
                      type="button"
                      className="ord-icon-btn"
                      title="View order"
                      onClick={() => onViewOrder(order)}
                    >
                      <Eye size={16} />
                    </button>
                    {order.status !== 'Cancelled' && order.status !== 'Refunded' ? (
                      <button
                        type="button"
                        className="ord-icon-btn ord-icon-btn--danger"
                        title="Cancel order"
                        disabled={updatingId === order._id}
                        onClick={() => onCancel(order._id)}
                      >
                        <X size={16} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ord-cards ord-cards--mobile">
        {orders.map((order) => (
          <article key={order._id} className="ord-card">
            <div className="ord-card__head">
              <div>
                <Link to={`/admin/orders/${order._id}`}><strong>{order.orderNo}</strong></Link>
                <small>{order.customer?.name || 'Guest'}</small>
              </div>
              <strong>{formatCurrency(order.totals?.total || 0)}</strong>
            </div>
            <div className="ord-card__meta">
              <OrderPaymentMethod order={order} />
              <span>{formatOrderDate(order.createdAt)}</span>
            </div>
            <select
              className="ord-status-select"
              value={order.status}
              disabled={updatingId === order._id}
              onChange={(e) => onStatusChange(order._id, e.target.value)}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button type="button" className="ord-btn ord-btn--ghost" onClick={() => onViewOrder(order)}>
              View details
            </button>
          </article>
        ))}
      </div>
    </>
  )
}

export function AdminOrdersPage() {
  const list = useOrderList()
  const [updatingId, setUpdatingId] = useState('')
  const [viewOrder, setViewOrder] = useState(null)

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId)
    try {
      await list.updateOrderStatus(orderId, status)
    } finally {
      setUpdatingId('')
    }
  }

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return
    await handleStatusChange(orderId, 'Cancelled')
  }

  return (
    <div className="ord-page ord-page--manage">
      <header className="ord-page-header ord-page-header--manage">
        <div>
          <h1>Orders</h1>
          <p>Manage customer orders with real-time updates</p>
        </div>
        <button
          type="button"
          className="ord-refresh-btn"
          onClick={list.load}
          disabled={list.loading}
          aria-label="Refresh orders"
        >
          <RefreshCw size={18} className={list.loading ? 'is-spinning' : ''} />
        </button>
      </header>

      {list.error ? (
        <div className="ord-alert ord-alert--error">
          {list.error}
          <button type="button" className="ord-btn ord-btn--ghost" onClick={list.load}>Retry</button>
        </div>
      ) : null}

      <OrderAnalyticsBar analytics={list.analytics} />

      <div className="ord-toolbar-simple">
        <label className="ord-search ord-search--simple" htmlFor="order-search">
          <Search size={18} aria-hidden="true" />
          <input
            id="order-search"
            type="search"
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search orders..."
            aria-label="Search orders"
          />
        </label>
        <label className="ord-status-filter">
          Status
          <select
            value={list.filters.orderStatus}
            onChange={(e) => {
              list.setFilters({ ...list.filters, orderStatus: e.target.value })
              list.setPage(1)
            }}
          >
            <option value="">All Status</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <section className="ord-panel ord-panel--simple">
        <OrdersSimpleTable
          orders={list.paginated}
          loading={list.loading}
          onStatusChange={handleStatusChange}
          onCancel={handleCancel}
          updatingId={updatingId}
          onViewOrder={setViewOrder}
        />
        <OrderPagination
          page={list.page}
          totalPages={list.totalPages}
          pageSize={list.pageSize}
          onPageChange={list.setPage}
          onPageSizeChange={(size) => { list.setPageSize(size); list.setPage(1) }}
        />
      </section>

      <OrderDetailsModal
        order={viewOrder}
        open={Boolean(viewOrder)}
        onClose={() => setViewOrder(null)}
      />
    </div>
  )
}
