import { Eye, MoreHorizontal, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../utils/format'
import { getCustomerInitials, getItemsCount, getProductPreview } from '../../../utils/orderAdminUtils'
import { Skeleton } from '../ui/Loader'
import { OrderEmptyState, OrderStatusBadge, PaymentStatusBadge, ShippingStatusBadge } from './OrderStatusBadge'

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'

const formatDelivery = (order) => {
  if (order.shipment?.deliveredAt) return formatDate(order.shipment.deliveredAt)
  if (order.shipment?.shippedAt) return 'In transit'
  return '—'
}

export function OrderTable({
  orders,
  loading,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  visibleColumns,
  sortKey,
  sortDir,
  onSort,
  density,
  hasFilters,
  onClearFilters,
}) {
  if (loading) {
    return (
      <div className="ord-table-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="ord-table-skeleton-row" />
        ))}
      </div>
    )
  }

  if (!orders.length) {
    return <OrderEmptyState hasFilters={hasFilters} onClear={onClearFilters} />
  }

  const show = (col) => visibleColumns.includes(col)
  const sortBtn = (key, label) => (
    <button type="button" className="ord-sort-btn" onClick={() => onSort(key)}>
      {label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  )

  return (
    <>
      <div className={`ord-table-wrap ord-table-wrap--desktop ord-table--${density}`}>
        <table className="ord-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all orders"
                  checked={selected.length === orders.length && orders.length > 0}
                  onChange={onToggleSelectAll}
                />
              </th>
              {show('orderNo') && <th>{sortBtn('orderNo', 'Order')}</th>}
              {show('customer') && <th>{sortBtn('customer', 'Customer')}</th>}
              {show('products') && <th>Products</th>}
              {show('items') && <th>{sortBtn('items', 'Items')}</th>}
              {show('date') && <th>{sortBtn('createdAt', 'Date')}</th>}
              {show('paymentMethod') && <th>Payment</th>}
              {show('paymentStatus') && <th>Pay Status</th>}
              {show('shippingStatus') && <th>Shipping</th>}
              {show('orderStatus') && <th>Status</th>}
              {show('coupon') && <th>Coupon</th>}
              {show('total') && <th>{sortBtn('total', 'Total')}</th>}
              {show('staff') && <th>Staff</th>}
              {show('delivery') && <th>Delivery</th>}
              {show('actions') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="ord-table__row">
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(order._id)}
                    onChange={() => onToggleSelect(order._id)}
                    aria-label={`Select ${order.orderNo}`}
                  />
                </td>
                {show('orderNo') && (
                  <td>
                    <Link to={`/admin/orders/${order._id}`} className="ord-name-link">
                      <strong>{order.orderNo}</strong>
                    </Link>
                  </td>
                )}
                {show('customer') && (
                  <td>
                    <div className="ord-customer-cell">
                      <span className="ord-avatar">{getCustomerInitials(order)}</span>
                      <div>
                        <strong>{order.customer?.name || 'Guest'}</strong>
                        <small>{order.customer?.email}</small>
                      </div>
                    </div>
                  </td>
                )}
                {show('products') && <td className="ord-products-cell">{getProductPreview(order)}</td>}
                {show('items') && <td>{getItemsCount(order)}</td>}
                {show('date') && <td>{formatDate(order.createdAt)}</td>}
                {show('paymentMethod') && <td>{order.payment?.provider || 'Razorpay'}</td>}
                {show('paymentStatus') && (
                  <td>
                    <PaymentStatusBadge status={order.payment?.status} />
                  </td>
                )}
                {show('shippingStatus') && (
                  <td>
                    <ShippingStatusBadge order={order} />
                  </td>
                )}
                {show('orderStatus') && (
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                )}
                {show('coupon') && <td>{order.couponCode || '—'}</td>}
                {show('total') && <td><strong>{formatCurrency(order.totals?.total || 0)}</strong></td>}
                {show('staff') && <td><span className="ord-todo">—</span></td>}
                {show('delivery') && <td>{formatDelivery(order)}</td>}
                {show('actions') && (
                  <td>
                    <div className="ord-row-actions">
                      <Link to={`/admin/orders/${order._id}`} className="ord-icon-btn" title="View">
                        <Eye size={16} />
                      </Link>
                      <button type="button" className="ord-icon-btn" title="Print (TODO invoice API)" onClick={() => window.print()}>
                        <Printer size={16} />
                      </button>
                      <Link to={`/admin/orders/${order._id}`} className="ord-icon-btn" title="More">
                        <MoreHorizontal size={16} />
                      </Link>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ord-cards ord-cards--mobile">
        {orders.map((order) => (
          <article key={order._id} className="ord-card">
            <div className="ord-card__head">
              <input
                type="checkbox"
                checked={selected.includes(order._id)}
                onChange={() => onToggleSelect(order._id)}
                aria-label={`Select ${order.orderNo}`}
              />
              <span className="ord-avatar">{getCustomerInitials(order)}</span>
              <div>
                <Link to={`/admin/orders/${order._id}`}><strong>{order.orderNo}</strong></Link>
                <small>{order.customer?.name}</small>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="ord-card__meta">
              <span>{formatCurrency(order.totals?.total || 0)}</span>
              <span>{getItemsCount(order)} items</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="ord-row-actions">
              <Link to={`/admin/orders/${order._id}`} className="ord-btn ord-btn--ghost">View</Link>
              <PaymentStatusBadge status={order.payment?.status} />
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

export function OrderPagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }) {
  return (
    <div className="ord-pagination">
      <label>
        Rows
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </label>
      <div className="ord-pagination__nav">
        <button type="button" className="ord-btn ord-btn--ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="ord-btn ord-btn--ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
