import { formatCurrency } from '../../../utils/format'

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'

export function OrderPaymentCard({ order }) {
  const payment = order.payment || {}

  return (
    <section className="ord-panel">
      <h2>Payment Details</h2>
      <dl className="ord-summary-grid">
        <div><dt>Transaction ID</dt><dd>{payment.razorpayPaymentId || '—'}</dd></div>
        <div><dt>Gateway Order ID</dt><dd>{payment.razorpayOrderId || '—'}</dd></div>
        <div><dt>Gateway</dt><dd>{payment.provider || 'Razorpay'}</dd></div>
        <div><dt>Status</dt><dd>{payment.status || 'Pending'}</dd></div>
        <div><dt>Paid Amount</dt><dd>{formatCurrency(order.totals?.total || 0)}</dd></div>
        <div><dt>Refund Amount</dt><dd><span className="ord-todo">TODO refund API</span></dd></div>
        <div><dt>Payment Date</dt><dd>{formatDate(payment.paidAt)}</dd></div>
      </dl>
    </section>
  )
}

export function OrderShippingCard({ order }) {
  const shipment = order.shipment || {}

  return (
    <section className="ord-panel">
      <h2>Shipping Details</h2>
      <dl className="ord-summary-grid">
        <div><dt>Courier</dt><dd>{shipment.courierName || shipment.provider || '—'}</dd></div>
        <div><dt>Tracking Number</dt><dd>{shipment.awbCode || shipment.shipmentId || '—'}</dd></div>
        <div><dt>Tracking Link</dt><dd>{shipment.trackingUrl ? <a href={shipment.trackingUrl} target="_blank" rel="noreferrer">Track shipment</a> : '—'}</dd></div>
        <div><dt>Shipping Cost</dt><dd>{formatCurrency(order.totals?.shipping || 0)}</dd></div>
        <div><dt>Estimated Delivery</dt><dd><span className="ord-todo">TODO ETA API</span></dd></div>
        <div><dt>Shipped</dt><dd>{formatDate(shipment.shippedAt)}</dd></div>
        <div><dt>Delivered</dt><dd>{formatDate(shipment.deliveredAt)}</dd></div>
      </dl>
      <p className="ord-todo">Generate label: auto-created when status set to Shipped via existing API.</p>
    </section>
  )
}

export function OrderAddressCards({ order }) {
  return (
    <div className="ord-address-grid">
      <section className="ord-panel">
        <h2>Shipping Address</h2>
        <pre className="ord-address">{formatAddressBlock(order.shippingAddress)}</pre>
      </section>
      <section className="ord-panel">
        <h2>Billing Address</h2>
        <pre className="ord-address">{formatAddressBlock(order.billingAddress || order.shippingAddress)}</pre>
      </section>
    </div>
  )
}

function formatAddressBlock(address) {
  if (!address) return '—'
  return [
    address.fullName,
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.pincode}`,
    address.country,
    `Phone: ${address.phone}`,
    address.email,
  ].filter(Boolean).join('\n')
}
