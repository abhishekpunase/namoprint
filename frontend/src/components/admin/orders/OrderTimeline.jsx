import { buildOrderTimeline } from '../../../utils/orderAdminUtils'

const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
    : '—'

export function OrderTimeline({ order }) {
  const events = buildOrderTimeline(order)

  if (!events.length) {
    return <p className="ord-subpanel__hint">No timeline events yet.</p>
  }

  return (
    <ol className="ord-timeline">
      {events.map((event) => (
        <li key={event.id} className="ord-timeline__item">
          <div className="ord-timeline__dot" />
          <div className="ord-timeline__body">
            <div className="ord-timeline__head">
              <strong>{event.title}</strong>
              <time>{formatTime(event.timestamp)}</time>
            </div>
            <p>{event.description}</p>
            <small>{event.user}</small>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function OrderNotesPanel({ order }) {
  return (
    <section className="ord-panel">
      <h2>Notes</h2>
      {order.adminNotes ? (
        <div className="ord-note">
          <strong>Admin Notes</strong>
          <p>{order.adminNotes}</p>
        </div>
      ) : (
        <p className="ord-subpanel__hint">No admin notes on this order.</p>
      )}
      <p className="ord-todo">Add/edit notes: TODO — requires order update API (only status endpoint exists today).</p>
      {order.specialDate && (
        <div className="ord-note">
          <strong>{order.specialDateLabel || 'Special Date'}</strong>
          <p>{new Date(order.specialDate).toLocaleDateString('en-IN')}</p>
        </div>
      )}
    </section>
  )
}

export function OrderInvoicePanel({ order }) {
  return (
    <section className="ord-panel">
      <h2>Invoice</h2>
      <dl className="ord-summary-grid">
        <div><dt>Invoice Number</dt><dd>{order.orderNo}</dd></div>
        <div><dt>Status</dt><dd>{order.payment?.status === 'Paid' ? 'Paid' : 'Pending'}</dd></div>
      </dl>
      <div className="ord-invoice-actions">
        <button type="button" className="ord-btn ord-btn--ghost" disabled title="TODO: PDF invoice API">Download PDF (TODO)</button>
        <button type="button" className="ord-btn ord-btn--ghost" disabled title="TODO: email invoice API">Email Invoice (TODO)</button>
        <button type="button" className="ord-btn ord-btn--ghost" onClick={() => window.print()}>Print Preview</button>
      </div>
    </section>
  )
}
