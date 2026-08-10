import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../utils/format'
import { getProductPreview } from '../../../utils/orderAdminUtils'
import { OrderStatusBadge } from '../orders/OrderStatusBadge'
import { formatCustomerDate } from '../../../utils/customerAdminUtils'

export function OrderHistory({ orders = [] }) {
  if (!orders.length) {
    return (
      <section className="crm-panel crm-panel--wide">
        <h2>Order History</h2>
        <div className="crm-empty"><p>No orders yet</p></div>
      </section>
    )
  }

  return (
    <section className="crm-panel crm-panel--wide">
      <h2>Order History ({orders.length})</h2>
      <div className="crm-table-wrap">
        <table className="crm-table crm-table--orders">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Products</th>
              <th>Payment</th>
              <th>Shipping</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id || order.id}>
                <td><strong>{order.orderNo}</strong></td>
                <td className="crm-products-cell">{getProductPreview(order)}</td>
                <td>
                  <span className={`crm-pay crm-pay--${(order.payment?.status || 'pending').toLowerCase()}`}>
                    {order.payment?.status || 'Pending'}
                  </span>
                </td>
                <td>{order.shipment?.courierName || order.status === 'Shipped' ? 'Shipped' : '—'}</td>
                <td>{formatCurrency(order.totals?.total || 0)}</td>
                <td><OrderStatusBadge status={order.status} /></td>
                <td>{formatCustomerDate(order.createdAt)}</td>
                <td><Link to={`/admin/orders/${order._id || order.id}`} className="crm-btn crm-btn--ghost">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function PaymentHistory({ orders = [] }) {
  const payments = orders
    .filter((o) => o.payment)
    .map((o) => ({
      id: o._id || o.id,
      orderNo: o.orderNo,
      status: o.payment.status,
      provider: o.payment.provider || 'razorpay',
      amount: o.totals?.total || 0,
      paidAt: o.payment.paidAt || o.createdAt,
    }))

  return (
    <section className="crm-panel">
      <h2>Payment Records</h2>
      {!payments.length ? (
        <p className="crm-empty-inline">No payment records</p>
      ) : (
        <ul className="crm-payment-list">
          {payments.slice(0, 10).map((p) => (
            <li key={p.id}>
              <strong>{p.orderNo}</strong>
              <span>{p.provider} · {p.status}</span>
              <span>{formatCurrency(p.amount)}</span>
              <time>{formatCustomerDate(p.paidAt)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
