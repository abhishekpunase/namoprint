import { Package } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { StatusBadge } from '../ui/StatusBadge'
import { isCatalogDemoProduct } from '../../../utils/adminProductCatalog'

export function ProductStatusBadge({ product }) {
  if (isCatalogDemoProduct(product)) {
    return <StatusBadge tone="info">Catalog Demo</StatusBadge>
  }

  const stock = (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)
  if (!product.isActive) return <StatusBadge tone="neutral">Hidden</StatusBadge>
  if (stock <= 0) return <StatusBadge tone="danger">Out of Stock</StatusBadge>
  if (stock <= 5) return <StatusBadge tone="warning">Low Stock</StatusBadge>
  return <StatusBadge tone="success">Published</StatusBadge>
}

export function ProductEmptyState({ hasFilters, onClear, onCreate }) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={Package}
        title="No search results"
        description="Try adjusting filters or search terms."
        action={
          <button type="button" className="prod-btn prod-btn--ghost" onClick={onClear}>
            Clear filters
          </button>
        }
      />
    )
  }

  return (
    <EmptyState
      icon={Package}
      title="No products found"
      description="Create your first product to start selling personalized prints."
      action={
        <button type="button" className="prod-btn prod-btn--primary" onClick={onCreate}>
          Add Product
        </button>
      }
    />
  )
}
