import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Copy, Edit2, ExternalLink, Trash2 } from 'lucide-react'
import { api } from '../../../services/api'
import { loadAdminProductCatalog } from '../../../utils/adminProductCatalog'
import {
  buildCategoryPayload,
  categoryToForm,
  findCategoryById,
  getCategoryParentName,
  getProductsForCategory,
} from '../../../utils/categoryFormUtils'
import { CategoryStatusBadge } from './CategoryStatusBadge'
import { CategoryProductsPanel } from './CategoryProductsPanel'
import { ActivityTimeline } from '../dashboard/ActivityTimeline'
import { Skeleton } from '../ui/Loader'

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'

export function CategoryDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () =>
    Promise.all([api.adminCategories(), loadAdminProductCatalog()])
      .then(([categoriesPayload, productCatalog]) => {
        const cats = categoriesPayload.categories || []
        const found = findCategoryById(id, cats)
        if (!found) throw new Error('Category not found')
        setCategory(found)
        setCategories(cats)
        setProducts(getProductsForCategory(id, productCatalog))
      })
      .catch((err) => setError(err.message))

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [id])

  const duplicate = async () => {
    if (!category) return
    try {
      const form = categoryToForm(category)
      form.name = `${form.name} (Copy)`
      const payload = buildCategoryPayload(form)
      await api.adminCreateCategory(payload)
      navigate('/admin/categories')
    } catch (err) {
      setError(err.message)
    }
  }

  const archive = async () => {
    if (!window.confirm('Archive this category?')) return
    await api.adminDeleteCategory(id)
    navigate('/admin/categories')
  }

  if (loading) {
    return (
      <div className="cat-detail">
        <Skeleton className="cat-detail-skeleton" />
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="cat-detail">
        <div className="cat-alert cat-alert--error">{error || 'Category not found'}</div>
        <Link to="/admin/categories" className="cat-btn cat-btn--ghost">Back to categories</Link>
      </div>
    )
  }

  const activity = [
    {
      id: `created-${category._id}`,
      type: 'product',
      title: 'Category created',
      description: category.name,
      timestamp: category.createdAt,
      user: 'Admin',
    },
    {
      id: `updated-${category._id}`,
      type: 'inventory',
      title: 'Category updated',
      description: `${products.length} products linked`,
      timestamp: category.updatedAt,
      user: 'Admin',
    },
  ]

  return (
    <div className="cat-detail">
      <div className="cat-detail__banner">
        {category.imageUrl ? <img src={category.imageUrl} alt="" /> : <div className="cat-detail__banner-placeholder">{category.name}</div>}
      </div>

      <div className="cat-detail__head">
        <div>
          <nav className="cat-breadcrumb">
            <Link to="/admin/categories">Categories</Link> / <span>{category.name}</span>
          </nav>
          <h1>{category.name}</h1>
          <CategoryStatusBadge category={category} />
        </div>
        <div className="cat-detail__actions">
          <Link to={`/admin/categories/${id}/edit`} className="cat-btn cat-btn--primary">
            <Edit2 size={16} /> Edit
          </Link>
          <button type="button" className="cat-btn cat-btn--ghost" onClick={duplicate}>
            <Copy size={16} /> Duplicate
          </button>
          <a href={`/category/${category.productType}`} target="_blank" rel="noreferrer" className="cat-btn cat-btn--ghost">
            <ExternalLink size={16} /> Preview
          </a>
          <button type="button" className="cat-btn cat-btn--ghost" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/category/${category.productType}`)}>
            Copy Link
          </button>
          <button type="button" className="cat-btn cat-btn--danger" onClick={archive}>
            <Trash2 size={16} /> Archive
          </button>
        </div>
      </div>

      <div className="cat-detail__grid">
        <section className="cat-panel">
          <h2>Category Information</h2>
          <dl className="cat-detail__dl">
            <div><dt>Slug</dt><dd>{category.slug}</dd></div>
            <div><dt>Product Type</dt><dd>{category.productType?.replaceAll('-', ' ')}</dd></div>
            <div><dt>Parent</dt><dd>{getCategoryParentName(category, categories)}</dd></div>
            <div><dt>Sort Order</dt><dd>{category.sortOrder ?? 0}</dd></div>
            <div><dt>Products</dt><dd>{products.length}</dd></div>
            <div><dt>Created</dt><dd>{formatDate(category.createdAt)}</dd></div>
            <div><dt>Updated</dt><dd>{formatDate(category.updatedAt)}</dd></div>
            <div><dt>Last Modified By</dt><dd><span className="cat-todo">TODO user tracking</span></dd></div>
          </dl>
          {category.description && <p className="cat-detail__desc">{category.description}</p>}
        </section>

        <section className="cat-panel">
          <h2>Analytics</h2>
          <div className="cat-analytics-grid">
            <div className="cat-analytics-card"><strong>{products.length}</strong><span>Products</span></div>
            <div className="cat-analytics-card"><strong className="cat-todo">—</strong><span>Orders (TODO)</span></div>
            <div className="cat-analytics-card"><strong className="cat-todo">—</strong><span>Revenue (TODO)</span></div>
            <div className="cat-analytics-card"><strong className="cat-todo">—</strong><span>Views (TODO)</span></div>
          </div>
        </section>
      </div>

      <CategoryProductsPanel
        categoryId={id}
        products={products}
        categories={categories}
        onRefresh={() => load()}
      />

      <section className="cat-panel">
        <h2>Recent Activity</h2>
        <ActivityTimeline events={activity} />
      </section>
    </div>
  )
}
