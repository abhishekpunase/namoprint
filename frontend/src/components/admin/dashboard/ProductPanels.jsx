import { Link } from 'react-router-dom'
import { PackagePlus } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Loader'

export function LowStockPanel({ items = [], loading = false }) {
  if (loading) {
    return (
      <section className="dash-panel">
        <Skeleton className="dash-table-skeleton" />
      </section>
    )
  }

  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <h2>Low Stock Products</h2>
          <p>Variants at or below minimum threshold</p>
        </div>
      </div>

      {!items.length ? (
        <EmptyState title="Inventory looks healthy" description="No low-stock alerts right now." />
      ) : (
        <ul className="dash-stock-list">
          {items.map((item) => (
            <li key={item.id} className="dash-stock-list__item">
              <div className="dash-stock-list__thumb">
                {item.image ? <img src={item.image} alt="" /> : <span>{item.name?.slice(0, 2)}</span>}
              </div>
              <div className="dash-stock-list__meta">
                <strong>{item.name}</strong>
                <small>
                  SKU: {item.sku} · {item.size}
                </small>
              </div>
              <div className="dash-stock-list__counts">
                <span>Stock: {item.stock}</span>
                <span>Min: {item.minimum}</span>
              </div>
              <StatusBadge tone={item.stock <= 2 ? 'danger' : 'warning'}>
                {item.stock <= 2 ? 'Critical' : 'Low'}
              </StatusBadge>
              <Link className="dash-link-btn" to="/admin/products">
                <PackagePlus size={16} /> Restock
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function TopProductsPanel({ products = [], loading = false }) {
  if (loading) {
    return (
      <section className="dash-panel">
        <Skeleton className="dash-table-skeleton" />
      </section>
    )
  }

  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <h2>Top Selling Products</h2>
          <p>Based on order line items from existing orders API</p>
        </div>
      </div>

      {!products.length ? (
        <EmptyState title="No product sales yet" description="Top sellers will appear after orders are placed." />
      ) : (
        <ul className="dash-top-products">
          {products.map((product) => (
            <li key={product.id} className="dash-top-products__item">
              <div className="dash-stock-list__thumb">
                {product.image ? <img src={product.image} alt="" /> : <span>{product.name?.slice(0, 2)}</span>}
              </div>
              <div className="dash-top-products__meta">
                <strong>{product.name}</strong>
                <small>{product.category}</small>
              </div>
              <div className="dash-top-products__stats">
                <span>{product.sold} sold</span>
                <strong>₹{Math.round(product.revenue).toLocaleString('en-IN')}</strong>
              </div>
              <Link className="dash-link-btn" to="/admin/products">
                View Product
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
