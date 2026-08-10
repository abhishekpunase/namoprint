import { Copy, Edit2, ExternalLink, Eye, GripVertical, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCategoryParentName } from '../../../utils/categoryFormUtils'
import { Skeleton } from '../ui/Loader'
import { CategoryEmptyState, CategoryStatusBadge } from './CategoryStatusBadge'

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'

export function CategoryTable({
  categories,
  allCategories,
  loading,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  visibleColumns,
  sortKey,
  sortDir,
  onSort,
  onDelete,
  onDuplicate,
  countProducts,
  hasFilters,
  onClearFilters,
  onCreate,
}) {
  if (loading) {
    return (
      <div className="cat-table-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="cat-table-skeleton-row" />
        ))}
      </div>
    )
  }

  if (!categories.length) {
    return <CategoryEmptyState hasFilters={hasFilters} onClear={onClearFilters} onCreate={onCreate} />
  }

  const show = (col) => visibleColumns.includes(col)
  const sortBtn = (key, label) => (
    <button type="button" className="cat-sort-btn" onClick={() => onSort(key)}>
      {label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  )

  return (
    <>
      <div className="cat-table-wrap cat-table-wrap--desktop">
        <table className="cat-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all categories"
                  checked={selected.length === categories.length && categories.length > 0}
                  onChange={onToggleSelectAll}
                />
              </th>
              {show('image') && <th>Image</th>}
              {show('name') && <th>{sortBtn('name', 'Category Name')}</th>}
              {show('slug') && <th>Slug</th>}
              {show('parent') && <th>Parent</th>}
              {show('description') && <th>Description</th>}
              {show('products') && <th>{sortBtn('products', 'Products')}</th>}
              {show('status') && <th>Status</th>}
              {show('featured') && <th>Featured</th>}
              {show('created') && <th>{sortBtn('createdAt', 'Created')}</th>}
              {show('updated') && <th>{sortBtn('updatedAt', 'Updated')}</th>}
              {show('actions') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="cat-table__row">
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(cat._id)}
                    onChange={() => onToggleSelect(cat._id)}
                    aria-label={`Select ${cat.name}`}
                  />
                </td>
                {show('image') && (
                  <td>
                    <div className="cat-thumb">
                      {cat.imageUrl ? <img src={cat.imageUrl} alt="" /> : <span>{cat.name?.slice(0, 2)}</span>}
                    </div>
                  </td>
                )}
                {show('name') && (
                  <td>
                    <Link to={`/admin/categories/${cat._id}`} className="cat-name-link">
                      <strong>{cat.name}</strong>
                    </Link>
                    <small>{cat.productType?.replaceAll('-', ' ')}</small>
                  </td>
                )}
                {show('slug') && <td><code>{cat.slug}</code></td>}
                {show('parent') && <td>{getCategoryParentName(cat, allCategories)}</td>}
                {show('description') && <td className="cat-desc-cell">{cat.description || '—'}</td>}
                {show('products') && <td>{countProducts(cat._id)}</td>}
                {show('status') && (
                  <td>
                    <CategoryStatusBadge category={cat} />
                  </td>
                )}
                {show('featured') && <td><span className="cat-todo">TODO</span></td>}
                {show('created') && <td>{formatDate(cat.createdAt)}</td>}
                {show('updated') && <td>{formatDate(cat.updatedAt)}</td>}
                {show('actions') && (
                  <td>
                    <div className="cat-row-actions">
                      <Link to={`/admin/categories/${cat._id}`} className="cat-icon-btn" title="View">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/admin/categories/${cat._id}/edit`} className="cat-icon-btn" title="Edit">
                        <Edit2 size={16} />
                      </Link>
                      <a
                        href={`/category/${cat.productType}`}
                        target="_blank"
                        rel="noreferrer"
                        className="cat-icon-btn"
                        title="Preview storefront"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button type="button" className="cat-icon-btn" title="Duplicate" onClick={() => onDuplicate?.(cat)}>
                        <Copy size={16} />
                      </button>
                      <button type="button" className="cat-icon-btn is-danger" title="Archive" onClick={() => onDelete(cat)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cat-cards cat-cards--mobile">
        {categories.map((cat) => (
          <article key={cat._id} className="cat-card">
            <div className="cat-card__head">
              <input
                type="checkbox"
                checked={selected.includes(cat._id)}
                onChange={() => onToggleSelect(cat._id)}
                aria-label={`Select ${cat.name}`}
              />
              <div className="cat-thumb">
                {cat.imageUrl ? <img src={cat.imageUrl} alt="" /> : <span>{cat.name?.slice(0, 2)}</span>}
              </div>
              <div>
                <strong>{cat.name}</strong>
                <small>{cat.slug}</small>
              </div>
              <CategoryStatusBadge category={cat} />
            </div>
            <div className="cat-card__meta">
              <span>{countProducts(cat._id)} products</span>
              <span>{getCategoryParentName(cat, allCategories)}</span>
            </div>
            <div className="cat-row-actions">
              <Link to={`/admin/categories/${cat._id}/edit`} className="cat-btn cat-btn--ghost">Edit</Link>
              <Link to={`/admin/categories/${cat._id}`} className="cat-btn cat-btn--ghost">View</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

export function CategoryPagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }) {
  return (
    <div className="cat-pagination">
      <label>
        Rows
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </label>
      <div className="cat-pagination__nav">
        <button type="button" className="cat-btn cat-btn--ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="cat-btn cat-btn--ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}

/** Drag handle export for tree rows */
export function CategoryDragHandle() {
  return <GripVertical size={16} className="cat-drag-handle" aria-hidden="true" />
}
