import { FolderTree, Package } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { StatusBadge } from '../ui/StatusBadge'
import { getCategoryStatus } from '../../../utils/categoryFormUtils'

export function CategoryStatusBadge({ category }) {
  const status = getCategoryStatus(category)
  return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
}

export function CategoryEmptyState({ hasFilters, onClear, onCreate }) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={FolderTree}
        title="No search results"
        description="Try adjusting filters or search terms."
        action={
          <button type="button" className="cat-btn cat-btn--ghost" onClick={onClear}>
            Clear filters
          </button>
        }
      />
    )
  }

  return (
    <EmptyState
      icon={Package}
      title="No categories found"
      description="Create your first category to organize products on the storefront."
      action={
        <button type="button" className="cat-btn cat-btn--primary" onClick={onCreate}>
          Add Category
        </button>
      }
    />
  )
}
