import { formatCurrency } from '../../../utils/format'
import { formatCustomerDate } from '../../../utils/customerAdminUtils'
import { CouponStatusBadge } from './CouponStatusBadge'

export function CouponAnalytics({ coupon, topCustomers, topProducts }) {
  if (!coupon) return null

  const cards = [
    { label: 'Usage Count', value: coupon.usageCount },
    { label: 'Revenue Generated', value: formatCurrency(coupon.revenue || 0) },
    { label: 'Total Discount', value: formatCurrency(coupon.totalDiscount || 0) },
    { label: 'Average Order Value', value: formatCurrency(coupon.averageOrderValue || 0) },
    { label: 'Used Today', value: coupon.usedToday },
  ]

  return (
    <section className="cpn-panel">
      <h2>Coupon Analytics</h2>
      <div className="cpn-analytics-grid">
        {cards.map((c) => (
          <article key={c.label} className="cpn-stat-card">
            <span>{c.label}</span>
            <strong>{c.value}</strong>
          </article>
        ))}
      </div>
      <div className="cpn-lists-grid">
        <div>
          <h3>Top Customers</h3>
          {topCustomers?.length ? (
            <ul>
              {topCustomers.map((c) => (
                <li key={c.name}>{c.name} — {c.count} orders</li>
              ))}
            </ul>
          ) : (
            <p className="cpn-todo-hint">No usage yet</p>
          )}
        </div>
        <div>
          <h3>Top Products</h3>
          {topProducts?.length ? (
            <ul>
              {topProducts.map((p) => (
                <li key={p.name}>{p.name} — {p.qty} units</li>
              ))}
            </ul>
          ) : (
            <p className="cpn-todo-hint">No product data</p>
          )}
        </div>
      </div>
    </section>
  )
}

export function CouponTimeline({ activity }) {
  return (
    <section className="cpn-panel">
      <h2>Activity Timeline</h2>
      {!activity?.length ? (
        <p className="cpn-todo-hint">No activity recorded yet</p>
      ) : (
        <ul className="cpn-timeline">
          {activity.map((item) => (
            <li key={item.id}>
              <strong>{item.action}</strong>
              {item.detail ? <p>{item.detail}</p> : null}
              <time>{formatCustomerDate(item.timestamp)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function CouponDetailSummary({ coupon }) {
  if (!coupon) return null

  return (
    <section className="cpn-panel">
      <div className="cpn-panel__head">
        <div>
          <span className="cpn-code">{coupon.code}</span>
          <h2 style={{ marginTop: 8 }}>{coupon.name}</h2>
        </div>
        <CouponStatusBadge status={coupon.status} />
      </div>
      {coupon.description ? <p>{coupon.description}</p> : null}
      {coupon.isBackend ? (
        <p className="cpn-message cpn-message--warn">Live coupon from backend constants. Admin can update metadata only.</p>
      ) : (
        <p className="cpn-todo-hint">Local draft — not active at checkout until POST /admin/coupons is implemented.</p>
      )}
      <dl className="cpn-review" style={{ marginTop: 16 }}>
        <dt>Discount Type</dt><dd>{coupon.discountTypeLabel}</dd>
        <dt>Discount Value</dt><dd>{coupon.discountValueLabel}</dd>
        <dt>Applies To</dt><dd>{coupon.appliesTo}</dd>
        <dt>Max Usage</dt><dd>{coupon.maxUsage ?? 'Unlimited'}</dd>
        <dt>Start Date</dt><dd>{coupon.startDate ? formatCustomerDate(coupon.startDate) : '—'}</dd>
        <dt>Expiry Date</dt><dd>{coupon.expiryDate ? formatCustomerDate(coupon.expiryDate) : '—'}</dd>
        <dt>Created By</dt><dd>{coupon.createdBy}</dd>
        <dt>Last Updated</dt><dd>{formatCustomerDate(coupon.lastUpdated)}</dd>
      </dl>
    </section>
  )
}

export function CouponUsageTable({ orders }) {
  if (!orders?.length) {
    return (
      <section className="cpn-panel">
        <h2>Customer Usage</h2>
        <p className="cpn-todo-hint">No orders have used this coupon yet</p>
      </section>
    )
  }

  return (
    <section className="cpn-panel">
      <h2>Customer Usage ({orders.length})</h2>
      <div className="cpn-table-wrap">
        <table className="cpn-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Discount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 20).map((o) => (
              <tr key={o._id || o.id}>
                <td>{o.orderNumber || o._id?.slice(-6)}</td>
                <td>{o.customer?.name || o.customer?.email || 'Guest'}</td>
                <td>{formatCurrency(o.totals?.total || 0)}</td>
                <td>{formatCurrency(o.totals?.discount || 0)}</td>
                <td>{formatCustomerDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
