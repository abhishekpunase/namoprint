import { formatCurrency } from '../../../utils/format'

export function KpiGrid({ kpis, growth, loading }) {
  if (loading) {
    return (
      <div className="anl-kpi-grid">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="anl-kpi-card anl-skeleton" />
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Total Revenue', value: formatCurrency(kpis.totalRevenue), growth: growth?.revenue },
    { label: "Today's Revenue", value: formatCurrency(kpis.todayRevenue) },
    { label: 'Yesterday Revenue', value: formatCurrency(kpis.yesterdayRevenue) },
    { label: 'Monthly Revenue', value: formatCurrency(kpis.monthlyRevenue) },
    { label: 'Yearly Revenue', value: formatCurrency(kpis.yearlyRevenue) },
    { label: 'Total Orders', value: kpis.totalOrders, growth: growth?.orders },
    { label: 'Completed Orders', value: kpis.completedOrders },
    { label: 'Cancelled Orders', value: kpis.cancelledOrders },
    { label: 'Refunded Orders', value: kpis.refundedOrders },
    { label: 'Average Order Value', value: formatCurrency(kpis.averageOrderValue), growth: growth?.aov },
    { label: 'Average Basket Size', value: kpis.averageBasketSize?.toFixed(1) || '0' },
    { label: 'Gross Profit', value: 'TODO', todo: true },
    { label: 'Net Profit', value: 'TODO', todo: true },
    { label: 'Tax Collected', value: formatCurrency(kpis.taxCollected) },
    { label: 'Shipping Revenue', value: formatCurrency(kpis.shippingRevenue) },
    { label: 'Discount Amount', value: formatCurrency(kpis.discountAmount) },
  ]

  return (
    <div className="anl-kpi-grid">
      {cards.map((card) => (
        <article key={card.label} className={`anl-kpi-card ${card.todo ? 'anl-kpi-card--todo' : ''}`}>
          <span>{card.label}{card.todo ? ' *' : ''}</span>
          <strong>{card.value}</strong>
          {card.growth != null ? (
            <small className={`anl-kpi-card__growth ${card.growth >= 0 ? 'is-up' : 'is-down'}`}>
              {card.growth >= 0 ? '↑' : '↓'} {Math.abs(card.growth).toFixed(1)}% vs prev period
            </small>
          ) : null}
        </article>
      ))}
    </div>
  )
}

export function GoalsPanel({ kpis, goals, onUpdate }) {
  const items = [
    { key: 'monthlyRevenue', label: 'Monthly Revenue Goal', current: kpis.monthlyRevenue, target: goals.monthlyRevenue, format: formatCurrency },
    { key: 'ordersTarget', label: 'Orders Target', current: kpis.totalOrders, target: goals.ordersTarget, format: (v) => v },
    { key: 'customerTarget', label: 'Customer Target', current: kpis.totalCustomers, target: goals.customerTarget, format: (v) => v },
    { key: 'salesTarget', label: 'Sales Target', current: kpis.totalRevenue, target: goals.salesTarget, format: formatCurrency },
  ]

  return (
    <section className="anl-panel">
      <h2>Goals &amp; Targets</h2>
      <div className="anl-goals">
        {items.map((item) => {
          const pct = item.target ? Math.min(100, (item.current / item.target) * 100) : 0
          return (
            <div key={item.key} className="anl-goal">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span>{item.label}</span>
                <strong>{pct.toFixed(0)}%</strong>
              </div>
              <div className="anl-goal__bar"><span style={{ width: `${pct}%` }} /></div>
              <small>{item.format(item.current)} / {item.format(item.target)}</small>
            </div>
          )
        })}
      </div>
      <p className="anl-todo-hint" style={{ marginTop: 12 }}>Goals stored locally. TODO: sync with backend settings API.</p>
    </section>
  )
}

export function RealTimePanel({ realtime }) {
  return (
    <section className="anl-panel">
      <div className="anl-panel__head">
        <h2>Real-Time Snapshot</h2>
        <span className="anl-todo-hint" style={{ padding: '4px 10px' }}>Polling data — TODO: WebSocket live feed</span>
      </div>
      <div className="anl-realtime">
        <div className="anl-realtime-card"><span>Recent Revenue (loaded)</span><strong>{formatCurrency(realtime.liveRevenue)}</strong></div>
        <div className="anl-realtime-card"><span>Active Users</span><strong>{realtime.activeUsers}</strong></div>
        <div className="anl-realtime-card"><span>Live Orders</span><strong>{realtime.liveOrders.length}</strong></div>
      </div>
      <h3 style={{ marginTop: 16 }}>Recent Orders</h3>
      <ul className="anl-list">
        {realtime.liveOrders.slice(0, 5).map((o) => (
          <li key={o._id}><span>{o.orderNo}</span><strong>{formatCurrency(o.totals?.total || 0)}</strong></li>
        ))}
      </ul>
    </section>
  )
}
