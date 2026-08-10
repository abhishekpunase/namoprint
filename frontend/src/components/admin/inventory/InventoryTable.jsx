import { Link } from 'react-router-dom'
import { Edit3, Package } from 'lucide-react'
import { formatCustomerDate } from '../../../utils/customerAdminUtils'
import { StockStatusBadge } from './StockStatusBadge'

export function InventoryTable({
  rows,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  visibleColumns,
  sortKey,
  sortDir,
  onSort,
  onAdjust,
  density = 'comfortable',
}) {
  const show = (col) => visibleColumns.includes(col)
  const SortBtn = ({ col, label }) => (
    <button type="button" className="inv-sort-btn" onClick={() => onSort(col)}>
      {label} {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  )

  if (!rows.length) {
    return (
      <div className="inv-empty">
        <Package size={32} />
        <p>No inventory items match your filters</p>
      </div>
    )
  }

  return (
    <>
      <div className="inv-table-wrap">
        <table className={`inv-table ${density === 'compact' ? 'inv-table--compact' : ''}`}>
          <thead>
            <tr>
              <th><input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} aria-label="Select all" /></th>
              {show('image') && <th>Image</th>}
              {show('name') && <th><SortBtn col="productName" label="Product" /></th>}
              {show('sku') && <th><SortBtn col="sku" label="SKU" /></th>}
              {show('barcode') && <th>Barcode</th>}
              {show('category') && <th>Category</th>}
              {show('warehouse') && <th>Warehouse</th>}
              {show('current') && <th><SortBtn col="current" label="Current" /></th>}
              {show('reserved') && <th>Reserved</th>}
              {show('available') && <th><SortBtn col="available" label="Available" /></th>}
              {show('incoming') && <th>Incoming</th>}
              {show('min') && <th>Min</th>}
              {show('max') && <th>Max</th>}
              {show('status') && <th><SortBtn col="status" label="Status" /></th>}
              {show('updated') && <th><SortBtn col="updated" label="Updated" /></th>}
              {show('actions') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="inv-table__row">
                <td><input type="checkbox" checked={selected.includes(row.id)} onChange={() => onToggleSelect(row.id)} /></td>
                {show('image') && (
                  <td>
                    {row.image ? (
                      <img src={row.image} alt="" className="inv-thumb" loading="lazy" />
                    ) : (
                      <span className="inv-thumb inv-thumb--empty">—</span>
                    )}
                  </td>
                )}
                {show('name') && (
                  <td>
                    <Link to={`/admin/inventory/product/${row.productId}`} className="inv-name-link">
                      <strong>{row.productName}</strong>
                    </Link>
                    <small>{row.size} · {row.material}</small>
                  </td>
                )}
                {show('sku') && <td><code>{row.sku}</code></td>}
                {show('barcode') && <td className="inv-todo-cell">{row.barcode === '—' ? '—' : row.barcode}</td>}
                {show('category') && <td>{row.category}</td>}
                {show('warehouse') && <td>{row.warehouse}</td>}
                {show('current') && <td><strong>{row.currentStock}</strong></td>}
                {show('reserved') && <td>{row.reservedStock}</td>}
                {show('available') && <td>{row.availableStock}</td>}
                {show('incoming') && <td title="Local metadata — TODO purchase API">{row.incomingStock || '—'}</td>}
                {show('min') && <td>{row.minStock}</td>}
                {show('max') && <td>{row.maxStock}</td>}
                {show('status') && <td><StockStatusBadge status={row.status} /></td>}
                {show('updated') && <td>{formatCustomerDate(row.lastUpdated)}</td>}
                {show('actions') && (
                  <td>
                    <div className="inv-row-actions">
                      <Link to={`/admin/inventory/product/${row.productId}`} className="inv-icon-btn" title="View"><Package size={16} /></Link>
                      <button type="button" className="inv-icon-btn" title="Adjust stock" onClick={() => onAdjust(row)}><Edit3 size={16} /></button>
                      <Link to={`/admin/products/${row.productId}/edit`} className="inv-icon-btn" title="Edit product"><Edit3 size={16} /></Link>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="inv-cards--mobile">
        {rows.map((row) => (
          <article key={row.id} className="inv-card">
            <div className="inv-card__head">
              {row.image ? <img src={row.image} alt="" className="inv-thumb" /> : <span className="inv-thumb inv-thumb--empty">—</span>}
              <div>
                <Link to={`/admin/inventory/product/${row.productId}`}><strong>{row.productName}</strong></Link>
                <p>{row.sku}</p>
              </div>
              <StockStatusBadge status={row.status} />
            </div>
            <div className="inv-card__meta">
              <span>Stock {row.currentStock}</span>
              <span>Avail {row.availableStock}</span>
              <button type="button" className="inv-btn inv-btn--ghost" onClick={() => onAdjust(row)}>Adjust</button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

export function InventoryTableSkeleton() {
  return <div className="inv-skeleton inv-skeleton--table" />
}
