import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../services/api'
import { formatCurrency } from '../../../utils/format'

export function CategoryProductsPanel({ categoryId, products, categories, onRefresh }) {
  const [movingId, setMovingId] = useState('')
  const [targetCategory, setTargetCategory] = useState('')
  const [error, setError] = useState('')

  const assignCategory = async (productId, newCategoryId) => {
    if (!newCategoryId) return
    setError('')
    try {
      const cat = categories.find((c) => c._id === newCategoryId)
      const payload = { category: newCategoryId }
      if (cat?.parent) payload.subCategory = newCategoryId
      await api.adminUpdateProduct(productId, payload)
      onRefresh?.()
    } catch (err) {
      setError(err.message)
    }
  }

  const removeFromCategory = async (productId) => {
    setError('')
    try {
      const fallback = categories.find((c) => c.isActive) || categories[0]
      if (!fallback) return
      await api.adminUpdateProduct(productId, { category: fallback._id, subCategory: undefined })
      onRefresh?.()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!products.length) {
    return (
      <div className="cat-subpanel">
        <h4>Products in this category</h4>
        <p className="cat-subpanel__hint">No products assigned yet.</p>
        <Link to="/admin/products/new" className="cat-btn cat-btn--ghost">Add Product</Link>
      </div>
    )
  }

  return (
    <div className="cat-subpanel">
      <h4>Products ({products.length})</h4>
      {error && <p className="cat-alert cat-alert--error">{error}</p>}
      <ul className="cat-product-list">
        {products.slice(0, 12).map((product) => {
          const price = product.variants?.[0]?.price
          return (
            <li key={product._id}>
              <div className="cat-product-list__info">
                <Link to={`/admin/products/${product._id}`}>{product.title}</Link>
                <small>{price != null ? formatCurrency(price) : '—'}</small>
              </div>
              <div className="cat-product-list__actions">
                <select
                  value={movingId === product._id ? targetCategory : ''}
                  onChange={(e) => {
                    setMovingId(product._id)
                    setTargetCategory(e.target.value)
                    assignCategory(product._id, e.target.value)
                  }}
                  aria-label={`Change category for ${product.title}`}
                >
                  <option value="">Move to…</option>
                  {categories.filter((c) => c._id !== categoryId).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <button type="button" className="cat-btn cat-btn--ghost" onClick={() => removeFromCategory(product._id)}>
                  Reassign
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      {products.length > 12 && (
        <Link to={`/admin/products?category=${categoryId}`} className="cat-btn cat-btn--ghost">
          View all {products.length} products
        </Link>
      )}
    </div>
  )
}
