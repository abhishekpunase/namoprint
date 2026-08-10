import { formatCurrency } from '../../../utils/format'

export function OrderAnalyticsBar({ analytics }) {
  const cards = [
    { label: 'Total', value: analytics.totalOrders, tone: 'total' },
    { label: 'Pending', value: analytics.pendingOrders, tone: 'pending' },
    { label: 'In Progress', value: analytics.inProgressOrders || 0, tone: 'progress' },
    { label: 'Delivered', value: analytics.deliveredOrders, tone: 'delivered' },
    { label: 'Cancelled', value: analytics.cancelledOrders, tone: 'cancelled' },
  ]

  return (
    <div className="ord-analytics ord-analytics--stats">
      {cards.map((card) => (
        <div key={card.label} className={`ord-analytics__card ord-analytics__card--${card.tone}`}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </div>
      ))}
    </div>
  )
}

export function OrderPaymentMethod({ order }) {
  const provider = (order.payment?.provider || 'razorpay').toLowerCase()
  const isCod = provider === 'cod' || provider === 'cash'
  return (
    <span className={`ord-payment-pill ord-payment-pill--${isCod ? 'cod' : 'razorpay'}`}>
      <span className="ord-payment-pill__icon" aria-hidden="true">{isCod ? '₹' : '◆'}</span>
      {isCod ? 'COD' : 'Razorpay'}
    </span>
  )
}
