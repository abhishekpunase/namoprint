import { formatCurrency } from '../../../utils/format'
import { getItemsCount } from '../../../utils/orderAdminUtils'
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge'

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'

export function OrderSummaryCard({ order }) {
  const totals = order.totals || {}

  return (
    <section className="ord-panel">
      <h2>Order Summary</h2>
      <dl className="ord-summary-grid">
        <div><dt>Order Number</dt><dd>{order.orderNo}</dd></div>
        <div><dt>Invoice Number</dt><dd>{order.orderNo} <span className="ord-todo">(TODO dedicated invoice no.)</span></dd></div>
        <div><dt>Date</dt><dd>{formatDate(order.createdAt)}</dd></div>
        <div><dt>Items</dt><dd>{getItemsCount(order)}</dd></div>
        <div><dt>Status</dt><dd><OrderStatusBadge status={order.status} /></dd></div>
        <div><dt>Payment</dt><dd><PaymentStatusBadge status={order.payment?.status} /></dd></div>
      </dl>
      <div className="ord-totals">
        <div><span>Subtotal</span><strong>{formatCurrency(totals.subtotal || 0)}</strong></div>
        <div><span>Discount</span><strong>-{formatCurrency(totals.discount || 0)}</strong></div>
        {order.discountNote && <p className="ord-discount-note">{order.discountNote}</p>}
        <div><span>Tax</span><strong>{formatCurrency(totals.tax || 0)}</strong></div>
        <div><span>Shipping</span><strong>{formatCurrency(totals.shipping || 0)}</strong></div>
        {order.couponCode && <div><span>Coupon</span><strong>{order.couponCode}</strong></div>}
        <div className="ord-totals__grand"><span>Grand Total</span><strong>{formatCurrency(totals.total || 0)}</strong></div>
      </div>
    </section>
  )
}
