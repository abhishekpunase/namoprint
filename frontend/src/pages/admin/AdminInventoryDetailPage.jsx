import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useInventoryDetail } from '../../hooks/useInventoryList'
import { formatCurrency } from '../../utils/format'
import { StockStatusBadge } from '../../components/admin/inventory/StockStatusBadge'
import { AdjustmentModal } from '../../components/admin/inventory/AdjustmentModal'
import { StockTimeline } from '../../components/admin/inventory/InventoryPanels'
import { InventoryTableSkeleton } from '../../components/admin/inventory/InventoryTable'

export function AdminInventoryDetailPage() {
  const { productId } = useParams()
  const detail = useInventoryDetail(productId)
  const [adjustRow, setAdjustRow] = useState(null)
  const [adjustOpen, setAdjustOpen] = useState(false)

  const openAdjust = (row) => {
    setAdjustRow(row)
    setAdjustOpen(true)
  }

  const handleAdjustSave = async (payload) => {
    if (!adjustRow) return
    if (payload.mode === 'set') {
      await detail.setStockLevel(adjustRow.variantId, undefined, payload.newStock, payload.reason, payload.notes)
    } else {
      await detail.adjustStock({
        variantId: adjustRow.variantId,
        delta: payload.delta,
        reason: payload.reason,
        notes: payload.notes,
        type: payload.mode === 'increase' ? 'increase' : 'decrease',
      })
    }
    setAdjustOpen(false)
    setAdjustRow(null)
  }

  if (detail.loading) {
    return (
      <div className="inv-page">
        <InventoryTableSkeleton />
      </div>
    )
  }

  if (detail.error && !detail.product) {
    return (
      <div className="inv-page">
        <p className="inv-message inv-message--err">{detail.error}</p>
        <Link to="/admin/inventory" className="inv-back-link">← Back to inventory</Link>
      </div>
    )
  }

  const totalStock = detail.inventoryRows.reduce((s, r) => s + r.currentStock, 0)
  const totalValue = detail.inventoryRows.reduce((s, r) => s + r.currentStock * (r.price || 0), 0)

  return (
    <div className="inv-page">
      <header className="inv-page-header">
        <div>
          <nav className="inv-breadcrumb">
            <Link to="/admin">Admin</Link> / <Link to="/admin/inventory">Inventory</Link> / <span>{detail.product?.title}</span>
          </nav>
          <h1>{detail.product?.title}</h1>
          <p>Per-variant stock management · {detail.inventoryRows.length} variants</p>
        </div>
        <Link to={`/admin/products/${productId}/edit`} className="inv-btn inv-btn--ghost">Edit in Product Editor</Link>
      </header>

      {detail.message ? <p className="inv-message">{detail.message}</p> : null}
      {detail.error ? <p className="inv-message inv-message--warn">{detail.error}</p> : null}

      <div className="inv-dashboard inv-dashboard--detail">
        <article className="inv-stat-card"><span>Total Stock</span><strong>{totalStock}</strong></article>
        <article className="inv-stat-card"><span>Inventory Value</span><strong>{formatCurrency(totalValue)}</strong></article>
        <article className="inv-stat-card"><span>Reserved</span><strong>{detail.inventoryRows.reduce((s, r) => s + r.reservedStock, 0)}</strong></article>
        <article className="inv-stat-card"><span>Available</span><strong>{detail.inventoryRows.reduce((s, r) => s + r.availableStock, 0)}</strong></article>
      </div>

      <section className="inv-panel">
        <h2>Variant Inventory</h2>
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Size</th>
                <th>Material</th>
                <th>Frame</th>
                <th>Current</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Min</th>
                <th>Max</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {detail.inventoryRows.map((row) => (
                <tr key={row.id}>
                  <td><code>{row.sku}</code></td>
                  <td>{row.size}</td>
                  <td>{row.material}</td>
                  <td>{row.frameType}</td>
                  <td><strong>{row.currentStock}</strong></td>
                  <td>{row.reservedStock}</td>
                  <td>{row.availableStock}</td>
                  <td>
                    <input
                      type="number"
                      className="inv-inline-input"
                      defaultValue={row.minStock}
                      onBlur={(e) => detail.updateMeta(row.variantId, { minStock: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="inv-inline-input"
                      defaultValue={row.maxStock}
                      onBlur={(e) => detail.updateMeta(row.variantId, { maxStock: Number(e.target.value) })}
                    />
                  </td>
                  <td><StockStatusBadge status={row.status} /></td>
                  <td>
                    <button type="button" className="inv-btn inv-btn--ghost" onClick={() => openAdjust(row)} disabled={detail.saving}>
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <StockTimeline events={detail.history} />

      <AdjustmentModal
        open={adjustOpen}
        row={adjustRow}
        onClose={() => { setAdjustOpen(false); setAdjustRow(null) }}
        onSave={handleAdjustSave}
        saving={detail.saving}
      />
    </div>
  )
}
