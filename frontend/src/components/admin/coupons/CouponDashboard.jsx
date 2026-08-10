import { formatCurrency } from '../../../utils/format'

export function CouponDashboard({ stats, loading }) {
  if (loading) {
    return (
      <div className="cpn-dashboard cpn-dashboard--skeleton">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="cpn-stat-card cpn-skeleton" />
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Total Coupons', value: stats.total },
    { label: 'Active Coupons', value: stats.active, tone: 'success' },
    { label: 'Expired Coupons', value: stats.expired, tone: 'danger' },
    { label: 'Scheduled Coupons', value: stats.scheduled, tone: 'info' },
    { label: 'Coupons Used Today', value: stats.usedToday },
    { label: 'Total Discount Given', value: formatCurrency(stats.totalDiscount || 0) },
    { label: 'Average Discount', value: formatCurrency(stats.averageDiscount || 0) },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%` },
    { label: 'Revenue Generated', value: formatCurrency(stats.revenue || 0) },
  ]

  return (
    <div className="cpn-dashboard">
      {cards.map((card) => (
        <article key={card.label} className={`cpn-stat-card ${card.tone ? `cpn-stat-card--${card.tone}` : ''}`}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </div>
  )
}
