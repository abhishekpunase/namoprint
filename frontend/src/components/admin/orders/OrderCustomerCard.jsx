import { getCustomerInitials } from '../../../utils/orderAdminUtils'
import { formatCurrency } from '../../../utils/format'

export function OrderCustomerCard({ order, allOrders = [] }) {
  const customerEmail = order.customer?.email
  const customerOrders = allOrders.filter((o) => o.customer?.email === customerEmail)
  const lifetimeValue = customerOrders
    .filter((o) => o.payment?.status === 'Paid')
    .reduce((sum, o) => sum + (o.totals?.total || 0), 0)
  const firstOrder = customerOrders.length
    ? customerOrders.reduce((earliest, o) => (new Date(o.createdAt) < new Date(earliest.createdAt) ? o : earliest))
    : null

  return (
    <section className="ord-panel">
      <h2>Customer</h2>
      <div className="ord-customer-profile">
        <span className="ord-avatar ord-avatar--lg">{getCustomerInitials(order)}</span>
        <div>
          <strong>{order.customer?.name || 'Guest'}</strong>
          <p>{order.customer?.email}</p>
          <p>{order.customer?.phone}</p>
        </div>
      </div>
      <dl className="ord-summary-grid">
        <div><dt>Customer Since</dt><dd>{firstOrder ? new Date(firstOrder.createdAt).toLocaleDateString('en-IN') : '—'}</dd></div>
        <div><dt>Total Orders</dt><dd>{customerOrders.length}</dd></div>
        <div><dt>Lifetime Value</dt><dd>{formatCurrency(lifetimeValue)}</dd></div>
      </dl>
      <p className="ord-todo">Customer notes: TODO — no notes API on order model field for customer notes</p>
    </section>
  )
}
