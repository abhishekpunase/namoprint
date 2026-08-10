import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Copy, Edit2, ExternalLink, Trash2 } from 'lucide-react'
import { api } from '../../../services/api'
import { formatCurrency } from '../../../utils/format'
import {
  findAdminProductById,
  isCatalogDemoProduct,
  loadAdminProductCatalog,
} from '../../../utils/adminProductCatalog'
import { getMinPrice, getTotalStock, productToForm, buildProductPayload } from '../../../utils/productFormUtils'
import { ProductStatusBadge } from './ProductStatusBadge'
import { ActivityTimeline } from '../dashboard/ActivityTimeline'
import { Skeleton } from '../ui/Loader'

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'

export function ProductDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    Promise.all([loadAdminProductCatalog(), api.adminCategories()])
      .then(([catalog, categoriesPayload]) => {
        const found = findAdminProductById(id, catalog)
        if (!found) throw new Error('Product not found')
        setProduct(found)
        setCategories(categoriesPayload.categories || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const images = product?.images?.length
    ? product.images
    : product?.thumbnail
      ? [product.thumbnail, ...(product.mockup?.frameImage ? [product.mockup.frameImage] : [])]
      : product?.mockup?.frameImage
        ? [product.mockup.frameImage]
        : []

  const duplicate = async () => {
    if (!product) return
    try {
      const form = productToForm(product)
      form.title = `${form.title} (Copy)`
      const payload = buildProductPayload({ ...form, slug: '' }, categories)
      await api.adminCreateProduct(payload)
      navigate('/admin/products')
    } catch (err) {
      setError(err.message)
    }
  }

  const deactivate = async () => {
    if (isCatalogDemoProduct(product)) {
      setError('Catalog demo products are not in the database. Use Edit → Save to publish, or duplicate to create a database copy.')
      return
    }
    if (!window.confirm('Deactivate this product?')) return
    await api.adminDeleteProduct(id)
    navigate('/admin/products')
  }

  if (loading) {
    return (
      <div className="prod-detail">
        <Skeleton className="prod-detail-skeleton" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="prod-detail">
        <div className="prod-alert prod-alert--error">{error || 'Product not found'}</div>
        <Link to="/admin/products" className="prod-btn prod-btn--ghost">Back to products</Link>
      </div>
    )
  }

  const activity = [
    {
      id: `created-${product._id}`,
      type: 'product',
      title: 'Product created',
      description: product.title,
      timestamp: product.createdAt,
      user: 'Admin',
    },
    {
      id: `updated-${product._id}`,
      type: 'inventory',
      title: 'Product updated',
      description: `Stock ${getTotalStock(product)} units`,
      timestamp: product.updatedAt,
      user: 'Admin',
    },
  ]

  return (
    <div className="prod-detail">
      {isCatalogDemoProduct(product) ? (
        <div className="prod-alert prod-alert--info">
          This product is shown on the website from the catalog demo. Edit and save to publish it to the database, or duplicate to create a copy.
        </div>
      ) : null}
      <div className="prod-detail__head">
        <div>
          <nav className="prod-breadcrumb">
            <Link to="/admin/products">Products</Link> / <span>{product.title}</span>
          </nav>
          <h1>{product.title}</h1>
          <ProductStatusBadge product={product} />
        </div>
        <div className="prod-detail__actions">
          <Link to={`/admin/products/${id}/edit`} className="prod-btn prod-btn--primary">
            <Edit2 size={16} /> Edit
          </Link>
          <button type="button" className="prod-btn prod-btn--ghost" onClick={duplicate}>
            <Copy size={16} /> Duplicate
          </button>
          <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="prod-btn prod-btn--ghost">
            <ExternalLink size={16} /> Preview
          </a>
          <button type="button" className="prod-btn prod-btn--danger" onClick={deactivate}>
            <Trash2 size={16} /> Deactivate
          </button>
        </div>
      </div>

      <div className="prod-detail__grid">
        <section className="prod-detail__gallery prod-panel">
          <div className="prod-detail__hero">
            {images[activeImage] ? <img src={images[activeImage]} alt={product.title} /> : <span>No image</span>}
          </div>
          {images.length > 1 ? (
            <div className="prod-detail__thumbs">
              {images.map((url, index) => (
                <button key={url + index} type="button" className={index === activeImage ? 'is-active' : ''} onClick={() => setActiveImage(index)}>
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="prod-panel">
          <h2>Product information</h2>
          <dl className="prod-detail__dl">
            <div><dt>SKU</dt><dd>{product.variants?.[0]?.sku || '—'}</dd></div>
            <div><dt>Category</dt><dd>{product.category?.name || '—'}</dd></div>
            <div><dt>Type</dt><dd>{product.productType?.replaceAll('-', ' ')}</dd></div>
            <div><dt>Price from</dt><dd>{formatCurrency(getMinPrice(product))}</dd></div>
            <div><dt>Stock</dt><dd>{getTotalStock(product)}</dd></div>
            <div><dt>Featured</dt><dd>{product.isFeatured ? 'Yes' : 'No'}</dd></div>
            <div><dt>Created</dt><dd>{formatDate(product.createdAt)}</dd></div>
            <div><dt>Updated</dt><dd>{formatDate(product.updatedAt)}</dd></div>
          </dl>
          <p>{product.description || 'No description'}</p>
        </section>
      </div>

      <div className="prod-detail__grid prod-detail__grid--3">
        <section className="prod-panel">
          <h2>Inventory summary</h2>
          <ul className="prod-variant-summary">
            {(product.variants || []).map((v) => (
              <li key={v._id || v.sku}>
                <strong>{v.size}</strong>
                <span>{v.sku}</span>
                <span>Stock: {v.stock}</span>
                <span>{formatCurrency(v.price)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="prod-panel">
          <h2>Product analytics</h2>
          <p className="prod-todo">TODO: Connect views/orders/revenue analytics API</p>
          <dl className="prod-detail__dl">
            <div><dt>Views</dt><dd>—</dd></div>
            <div><dt>Orders</dt><dd>—</dd></div>
            <div><dt>Revenue</dt><dd>—</dd></div>
            <div><dt>Conversion</dt><dd>—</dd></div>
          </dl>
        </section>

        <section className="prod-panel">
          <h2>Reviews</h2>
          <p className="prod-todo">TODO: Connect reviews API</p>
          <p>Average rating: —</p>
        </section>
      </div>

      <section className="prod-panel">
        <ActivityTimeline events={activity} />
      </section>
    </div>
  )
}
