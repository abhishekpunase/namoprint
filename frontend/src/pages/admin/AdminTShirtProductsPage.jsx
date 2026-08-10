import { useEffect, useState } from 'react'
import { FiEdit2, FiExternalLink, FiPlus, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi'
import { api } from '../../services/api'
import { tShirtApi } from '../../services/tShirtApi'
import { ProductSeoFields } from '../../components/admin/products/ProductSeoFields'
import { formatCurrency } from '../../utils/format'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { buildSeoPayload, emptySeoFormFields, seoFieldsFromProduct } from '../../utils/productSeoAdmin'

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const emptyForm = {
  title: '',
  description: '',
  longDescription: '',
  highlights: '',
  images: [],
  price: '',
  compareAtPrice: '',
  sizes: DEFAULT_SIZES.join(', '),
  stock: '500',
  rating: '4.5',
  reviewCount: '0',
  isFeatured: false,
  isActive: true,
  sortOrder: '0',
  slug: '',
  ...emptySeoFormFields,
}

export function AdminTShirtProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadProducts = () =>
    tShirtApi
      .adminList()
      .then((payload) => setProducts(payload.items || []))
      .catch((err) => setError(err.message))

  useEffect(() => {
    loadProducts()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId('')
  }

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const uploaded = []
      for (const file of files) {
        const payload = await api.uploadPhoto(file)
        const url = payload.asset?.url || payload.asset?.optimizedUrl
        if (url) uploaded.push(url)
      }
      if (uploaded.length) {
        setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const removeImage = (index) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const price = Number(form.price)
    if (!form.title.trim() || Number.isNaN(price) || price < 0) {
      setError('Title and a valid price are required.')
      return
    }

    const sizes = form.sizes
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)

    if (!sizes.length) {
      setError('Add at least one size (e.g. S, M, L, XL, XXL).')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        longDescription: form.longDescription.trim() || form.description.trim(),
        highlights: form.highlights
          .split(',')
          .map((h) => h.trim())
          .filter(Boolean),
        images: form.images,
        price,
        compareAtPrice: form.compareAtPrice !== '' ? Number(form.compareAtPrice) : undefined,
        sizes,
        stock: Number(form.stock || 500),
        rating: Number(form.rating || 4.5),
        reviewCount: Number(form.reviewCount || 0),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder || 0),
        ...buildSeoPayload(form),
      }

      if (editingId) {
        await tShirtApi.adminUpdate(editingId, payload)
        setMessage('T-shirt product updated successfully.')
      } else {
        await tShirtApi.adminCreate(payload)
        setMessage('T-shirt product created successfully.')
      }
      resetForm()
      loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (product) => {
    setEditingId(product._id)
    setForm({
      title: product.title || '',
      description: product.description || '',
      longDescription: product.longDescription || '',
      highlights: (product.highlights || []).join(', '),
      images: product.images || [],
      price: product.price ?? '',
      compareAtPrice: product.compareAtPrice ?? '',
      sizes: (product.sizes || DEFAULT_SIZES).join(', '),
      stock: String(product.stock ?? 500),
      rating: String(product.rating ?? 4.5),
      reviewCount: String(product.reviewCount ?? 0),
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
      sortOrder: String(product.sortOrder ?? 0),
      slug: product.slug || '',
      ...seoFieldsFromProduct(product),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id) => {
    if (!window.confirm('Deactivate this t-shirt product?')) return
    try {
      await tShirtApi.adminDelete(id)
      setMessage('Product deactivated.')
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin-page admin-catalog-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">T-Shirt Printing Catalog</p>
          <h1>T-Shirt Print</h1>
          <p className="admin-page-sub">
            Add products at the top — they appear on the storefront below.
            <a href="/t-shirt-printing" target="_blank" rel="noreferrer" className="admin-inline-link">
              View storefront <FiExternalLink aria-hidden />
            </a>
          </p>
        </div>
        <div className="admin-stat-grid admin-stat-grid--compact">
          <div className="admin-stat-card">
            <span>Total products</span>
            <strong>{products.length}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Active</span>
            <strong>{products.filter((p) => p.isActive).length}</strong>
          </div>
        </div>
      </div>

      {error && <p className="form-message admin-alert admin-alert--error">{error}</p>}
      {message && <p className="form-success admin-alert admin-alert--success">{message}</p>}

      <div className="admin-catalog-stack">
        {/* Form — top */}
        <section className="admin-panel admin-catalog-form">
          <div className="admin-panel-toolbar">
            <div>
              <h2>{editingId ? 'Edit t-shirt product' : 'Add t-shirt product'}</h2>
              <p className="admin-panel-desc">
                {editingId ? 'Update details and save changes.' : 'Fill in details, upload images, then publish.'}
              </p>
            </div>
            {editingId && (
              <button type="button" className="btn btn-ghost admin-btn-sm" onClick={resetForm}>
                <FiX /> Cancel edit
              </button>
            )}
          </div>

          <form className="admin-form admin-catalog-form-grid" onSubmit={submit}>
            <div className="admin-form-section">
              <h3 className="admin-form-section__title">Basic details</h3>
              <div className="admin-form-cols-2">
                <label className="admin-form-span-2">
                  Title
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sports Dry-Fit T-Shirt" />
                </label>
                <label className="admin-form-span-2">
                  Short description
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder="Brief summary for product card…"
                  />
                </label>
                <label className="admin-form-span-2">
                  Long description
                  <textarea
                    value={form.longDescription}
                    onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                    rows={4}
                    placeholder="Full details shown on product page…"
                  />
                </label>
                <label className="admin-form-span-2">
                  Highlights
                  <input
                    placeholder="Dry-fit fabric, HD print, All sizes"
                    value={form.highlights}
                    onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                  />
                </label>
              </div>
            </div>

            <div className="admin-form-section">
              <h3 className="admin-form-section__title">Pricing & inventory</h3>
              <div className="admin-form-cols-3">
                <label>
                  Price (per piece) *
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </label>
                <label>
                  Compare at price
                  <input
                    type="number"
                    min="0"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  />
                </label>
                <label>
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </label>
                <label className="admin-form-span-2">
                  Available sizes
                  <input
                    value={form.sizes}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                    placeholder="S, M, L, XL, XXL"
                  />
                </label>
                <label>
                  Sort order
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  />
                </label>
                <label>
                  Rating
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  />
                </label>
                <label>
                  Review count
                  <input
                    type="number"
                    min="0"
                    value={form.reviewCount}
                    onChange={(e) => setForm({ ...form, reviewCount: e.target.value })}
                  />
                </label>
              </div>
            </div>

            <div className="admin-form-section">
              <h3 className="admin-form-section__title">Product images</h3>
              <div className="admin-image-field">
                <div className="admin-image-list">
                  {form.images.map((url, index) => (
                    <div className="admin-image-thumb admin-image-thumb-lg" key={url + index}>
                      <img src={resolveMediaUrl(url)} alt="" />
                      <button type="button" onClick={() => removeImage(index)} aria-label="Remove image">
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  {!form.images.length && (
                    <p className="admin-empty-hint">No images yet — upload at least one product photo.</p>
                  )}
                </div>
                <label className="btn btn-ghost admin-upload-btn">
                  <FiUploadCloud /> {uploading ? 'Uploading…' : 'Upload image(s)'}
                  <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="admin-form-section admin-seo-section">
              <h3 className="admin-form-section__title">SEO</h3>
              <ProductSeoFields
                form={form}
                setForm={setForm}
                urlPrefix="/t-shirt-printing/"
                slug={form.slug}
                descriptionField="longDescription"
              />
            </div>

            <div className="admin-form-section admin-form-section--inline">
              <h3 className="admin-form-section__title">Visibility</h3>
              <div className="admin-toggle-row">
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  Featured on homepage
                </label>
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active on storefront
                </label>
              </div>
            </div>

            <div className="admin-form-actions admin-form-actions--sticky">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <FiPlus /> {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create product'}
              </button>
              {editingId && (
                <button className="btn btn-ghost" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Product list — bottom */}
        <section className="admin-panel admin-catalog-list">
          <div className="admin-panel-toolbar">
            <div>
              <h2>All t-shirt products</h2>
              <p className="admin-panel-desc">{products.length} product{products.length !== 1 ? 's' : ''} in catalog</p>
            </div>
          </div>

          {!products.length ? (
            <div className="admin-catalog-empty">
              <p>No t-shirt products yet.</p>
              <span>Use the form above to add your first product.</span>
            </div>
          ) : (
            <div className="admin-table-wrap admin-table-wrap--rounded">
              <table className="admin-table admin-table--catalog">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Sizes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="admin-table-product">
                          {product.images?.[0] ? (
                            <img src={resolveMediaUrl(product.images[0])} alt="" />
                          ) : (
                            <span className="admin-table-product__placeholder">T</span>
                          )}
                          <div>
                            <strong>{product.title}</strong>
                            <small>{product.slug}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{formatCurrency(product.price)}</strong>
                        {product.compareAtPrice > product.price && (
                          <small className="admin-price-compare">{formatCurrency(product.compareAtPrice)}</small>
                        )}
                      </td>
                      <td>
                        <span className="admin-size-tags">
                          {(product.sizes || []).map((size) => (
                            <span key={size} className="admin-size-tag">
                              {size}
                            </span>
                          ))}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${product.isActive ? 'is-success' : 'is-muted'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {product.isFeatured && <span className="status-pill is-info">Featured</span>}
                      </td>
                      <td className="admin-actions">
                        <button type="button" className="admin-action-btn" onClick={() => startEdit(product)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button type="button" className="admin-action-btn admin-action-btn--danger" onClick={() => remove(product._id)} title="Deactivate">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
