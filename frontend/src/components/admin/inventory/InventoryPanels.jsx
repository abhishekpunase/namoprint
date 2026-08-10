import { Link } from 'react-router-dom'
import { AlertTriangle, PackageX } from 'lucide-react'
import { StockStatusBadge } from './StockStatusBadge'

export function LowStockPanel({ rows, onAdjust, onRestock }) {
  if (!rows.length) {
    return (
      <section className="inv-panel">
        <h2><AlertTriangle size={18} /> Low Stock Alerts</h2>
        <p className="inv-empty-inline">No low stock items — threshold ≤ 5 units (matches dashboard).</p>
      </section>
    )
  }

  return (
    <section className="inv-panel">
      <header className="inv-panel__head">
        <h2><AlertTriangle size={18} /> Low Stock Alerts <span className="inv-badge">{rows.length}</span></h2>
      </header>
      <ul className="inv-alert-list">
        {rows.slice(0, 8).map((row) => (
          <li key={row.id}>
            <div>
              <strong>{row.productName}</strong>
              <span>{row.sku} · {row.currentStock} left</span>
            </div>
            <div className="inv-row-actions">
              <button type="button" className="inv-btn inv-btn--ghost" onClick={() => onRestock?.(row) || onAdjust?.(row)}>Quick Restock</button>
              <Link to={`/admin/inventory/product/${row.productId}`} className="inv-btn inv-btn--ghost">View</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function OutOfStockPanel({ rows, onAdjust }) {
  if (!rows.length) {
    return (
      <section className="inv-panel">
        <h2><PackageX size={18} /> Out of Stock</h2>
        <p className="inv-empty-inline">All tracked variants have stock available.</p>
      </section>
    )
  }

  return (
    <section className="inv-panel">
      <h2><PackageX size={18} /> Out of Stock <span className="inv-badge inv-badge--danger">{rows.length}</span></h2>
      <ul className="inv-alert-list">
        {rows.slice(0, 8).map((row) => (
          <li key={row.id}>
            <div>
              <strong>{row.productName}</strong>
              <span>{row.sku}</span>
              <StockStatusBadge status={row.status} />
            </div>
            <button type="button" className="inv-btn inv-btn--primary" onClick={() => onAdjust(row)}>Restock</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function WarehousePanel() {
  return (
    <section className="inv-panel">
      <h2>Warehouses</h2>
      <p className="inv-todo-hint">UI-only warehouse list. Backend has no warehouse model — stock lives on product variants.</p>
      <div className="inv-warehouse-grid">
        <article className="inv-warehouse-card">
          <h3>Main Warehouse</h3>
          <p>Default location for all inventory rows</p>
          <dl>
            <div><dt>Manager</dt><dd>— (TODO)</dd></div>
            <div><dt>Capacity</dt><dd>10,000 units</dd></div>
          </dl>
          <button type="button" className="inv-btn inv-btn--ghost" disabled>Transfer Stock (TODO)</button>
        </article>
      </div>
    </section>
  )
}

export function SupplierPanel() {
  return (
    <section className="inv-panel">
      <h2>Suppliers & Purchase Orders</h2>
      <div className="inv-empty inv-todo-panel">
        <p>No purchase order or supplier APIs in the backend.</p>
        <small>TODO: Supplier model, purchase orders, received stock workflows</small>
      </div>
    </section>
  )
}

export function InventoryAnalyticsPanel({ analytics }) {
  return (
    <section className="inv-panel inv-panel--wide">
      <h2>Inventory Analytics</h2>
      <div className="inv-analytics-grid">
        <div className="inv-stat-card"><span>Inventory Value</span><strong>{analytics.inventoryValue ? `₹${Math.round(analytics.inventoryValue).toLocaleString('en-IN')}` : '—'}</strong></div>
        <div className="inv-stat-card"><span>Stock Turnover (est.)</span><strong>{analytics.stockTurnover}</strong></div>
        <div className="inv-stat-card"><span>Dead Stock SKUs</span><strong>{analytics.deadStock}</strong></div>
        <div className="inv-stat-card"><span>Avg Units / SKU</span><strong>{analytics.averageInventory}</strong></div>
      </div>
      <div className="inv-analytics-columns">
        <div>
          <h3>Best Selling SKUs</h3>
          {!analytics.bestSelling?.length ? <p className="inv-empty-inline">No paid order data yet</p> : (
            <ul>{analytics.bestSelling.map((b) => <li key={b.sku}><strong>{b.sku}</strong> — {b.qty} sold</li>)}</ul>
          )}
        </div>
        <div>
          <h3>Slow Moving</h3>
          {!analytics.slowMoving?.length ? <p className="inv-empty-inline">—</p> : (
            <ul>{analytics.slowMoving.map((s) => <li key={s.sku}>{s.name} ({s.stock} in stock)</li>)}</ul>
          )}
        </div>
      </div>
    </section>
  )
}

export function StockTimeline({ events = [] }) {
  return (
    <section className="inv-panel">
      <h2>Stock History</h2>
      {!events.length ? (
        <p className="inv-empty-inline">No adjustments recorded yet. History stored locally until backend audit API exists.</p>
      ) : (
        <ol className="inv-timeline">
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.type} · {event.sku}</strong>
              <p>{event.reason} — {event.previous} → {event.newStock} ({event.change >= 0 ? '+' : ''}{event.change})</p>
              {event.notes ? <small>{event.notes}</small> : null}
              <time>{new Date(event.timestamp).toLocaleString('en-IN')}</time>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
