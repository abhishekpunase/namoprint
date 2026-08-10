import { resolveMediaUrl } from '../../../utils/mediaUrl'
import { Copy, Edit2, ExternalLink, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../utils/format'
import { isCatalogDemoProduct } from '../../../utils/adminProductCatalog'
import { getMinPrice, getPrimarySku, getSalePrice, getTotalStock } from '../../../utils/productFormUtils'
import { Skeleton } from '../ui/Loader'
import { ProductStatusBadge } from './ProductStatusBadge'
import { ProductEmptyState } from './ProductStatusBadge'

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'

const formatCategory = (product) =>
  product.category?.name || product.productType?.replaceAll('-', ' ') || '—'

export function ProductTable({
  products,
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
  hasFilters,
  onClearFilters,
  onCreate,
}) {
  if (loading) {
    return (
      <div className="prod-table-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="prod-table-skeleton-row" />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return <ProductEmptyState hasFilters={hasFilters} onClear={onClearFilters} onCreate={onCreate} />
  }

  const show = (col) => visibleColumns.includes(col)
  const sortBtn = (key, label) => (
    <button type="button" className="prod-sort-btn" onClick={() => onSort(key)}>
      {label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  )

  return (
    <>
      <div className="prod-table-wrap prod-table-wrap--desktop">
        <table className="prod-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all products"
                  checked={selected.length === products.length && products.length > 0}
                  onChange={onToggleSelectAll}
                />
              </th>
              {show('image') && <th>Image</th>}
              {show('name') && <th>{sortBtn('title', 'Product Name')}</th>}
              {show('sku') && <th>SKU</th>}
              {show('category') && <th>Category</th>}
              {show('brand') && <th>Brand</th>}
              {show('price') && <th>{sortBtn('price', 'Price')}</th>}
              {show('salePrice') && <th>Sale Price</th>}
              {show('stock') && <th>{sortBtn('stock', 'Stock')}</th>}
              {show('status') && <th>Status</th>}
              {show('visibility') && <th>Visibility</th>}
              {show('featured') && <th>Featured</th>}
              {show('created') && <th>{sortBtn('createdAt', 'Created')}</th>}
              {show('updated') && <th>{sortBtn('updatedAt', 'Updated')}</th>}
              {show('actions') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const image = resolveMediaUrl(
                product.thumbnail || product.images?.[0] || product.mockup?.frameImage,
              )
              const sale = getSalePrice(product)
              return (
                <tr key={product._id} className="prod-table__row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(product._id)}
                      onChange={() => onToggleSelect(product._id)}
                      aria-label={`Select ${product.title}`}
                    />
                  </td>
                  {show('image') && (
                    <td>
                      <div className="prod-thumb">{image ? <img src={image} alt="" /> : <span>{product.title?.slice(0, 2)}</span>}</div>
                    </td>
                  )}
                  {show('name') && (
                    <td>
                      <Link to={`/admin/products/${product._id}`} className="prod-name-link">
                        <strong>{product.title}</strong>
                      </Link>
                      <small>{product.slug}</small>
                    </td>
                  )}
                  {show('sku') && <td>{getPrimarySku(product)}</td>}
                  {show('category') && <td>{formatCategory(product)}</td>}
                  {show('brand') && <td>{product.attributes?.brand?.[0] || product.productType?.replaceAll('-', ' ') || '—'}</td>}
                  {show('price') && <td>{formatCurrency(getMinPrice(product))}</td>}
                  {show('salePrice') && <td>{sale ? formatCurrency(sale) : '—'}</td>}
                  {show('stock') && <td>{getTotalStock(product)}</td>}
                  {show('status') && (
                    <td>
                      <ProductStatusBadge product={product} />
                    </td>
                  )}
                  {show('visibility') && <td>{product.isActive ? 'Visible' : 'Hidden'}</td>}
                  {show('featured') && <td>{product.isFeatured ? 'Yes' : 'No'}</td>}
                  {show('created') && <td>{formatDate(product.createdAt)}</td>}
                  {show('updated') && <td>{formatDate(product.updatedAt)}</td>}
                  {show('actions') && (
                    <td>
                      <div className="prod-row-actions">
                        <Link to={`/admin/products/${product._id}`} className="prod-icon-btn" title="View">
                          <Eye size={14} />
                        </Link>
                        <Link to={`/admin/products/${product._id}/edit`} className="prod-icon-btn" title="Edit">
                          <Edit2 size={14} />
                        </Link>
                        <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="prod-icon-btn" title="Preview">
                          <ExternalLink size={14} />
                        </a>
                        <button type="button" className="prod-icon-btn" title="Duplicate" onClick={() => onDuplicate?.(product)}>
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          className="prod-icon-btn is-danger"
                          title={isCatalogDemoProduct(product) ? 'Demo — publish via Edit' : 'Deactivate'}
                          onClick={() => onDelete(product)}
                          disabled={isCatalogDemoProduct(product)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="prod-cards prod-cards--mobile">
        {products.map((product) => {
          const image = product.thumbnail || product.images?.[0] || product.mockup?.frameImage
          return (
            <article key={product._id} className="prod-card">
              <div className="prod-card__head">
                <input
                  type="checkbox"
                  checked={selected.includes(product._id)}
                  onChange={() => onToggleSelect(product._id)}
                  aria-label={`Select ${product.title}`}
                />
                <div className="prod-thumb">{image ? <img src={image} alt="" /> : <span>{product.title?.slice(0, 2)}</span>}</div>
                <div>
                  <strong>{product.title}</strong>
                  <small>{getPrimarySku(product)}</small>
                </div>
                <ProductStatusBadge product={product} />
              </div>
              <div className="prod-card__meta">
                <span>{formatCurrency(getMinPrice(product))}</span>
                <span>Stock {getTotalStock(product)}</span>
                <span>{formatCategory(product)}</span>
              </div>
              <div className="prod-row-actions">
                <Link to={`/admin/products/${product._id}/edit`} className="prod-btn prod-btn--ghost">Edit</Link>
                <Link to={`/admin/products/${product._id}`} className="prod-btn prod-btn--ghost">View</Link>
                <button type="button" className="prod-btn prod-btn--ghost" onClick={() => onDelete(product)}>
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

export function ProductPagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }) {
  return (
    <div className="prod-pagination">
      <label>
        Rows
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </label>
      <div className="prod-pagination__nav">
        <button type="button" className="prod-btn prod-btn--ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button type="button" className="prod-btn prod-btn--ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
