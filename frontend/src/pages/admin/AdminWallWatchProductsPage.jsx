import { useEffect, useState } from 'react'
import { FiEdit2, FiExternalLink, FiPlus, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { wallWatchApi } from '../../services/wallWatchApi'
import { ProductSeoFields } from '../../components/admin/products/ProductSeoFields'
import { AdminSwitchCard, AdminToggle } from '../../components/admin/ui/AdminToggle'
import { formatCurrency, getProductPrice } from '../../utils/format'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { buildSeoPayload, emptySeoFormFields, seoFieldsFromProduct } from '../../utils/productSeoAdmin'
import { WALL_WATCH_CATALOG_BASE } from '../../utils/wallWatchCatalog'
import {
  buildWallWatchAdminPayload,
  frameTypeForShape,
  getCollagePhotoCount,
  isCollageWallWatchProduct,
  resolveWallWatchShape,
  WALL_WATCH_COLLAGE_COUNTS,
  WALL_WATCH_SHAPE_OPTIONS,
} from '../../utils/wallWatchProductDefaults'

const WALL_WATCH_CATEGORY_LABEL = 'Acrylic Wall Clock'

function findWallWatchCategory(categories = []) {
  return (
    categories.find((c) => c.name?.trim().toLowerCase() === 'acrylic wall clock') ||
    categories.find((c) => /acrylic wall clock/i.test(c.name || '')) ||
    categories.find((c) => /wall|clock|watch/i.test(c.name || c.slug || '')) ||
    null
  )
}

const emptyVariant = (shape = 'Circle', collageEnabled = false) => ({
  size: '10 inch',
  frameType: frameTypeForShape(shape, collageEnabled),
  price: '',
  compareAtPrice: '',
  stock: '50',
  sku: '',
})

const emptyForm = {
  title: '',
  description: '',
  highlights: '',
  shape: 'Circle',
  collageEnabled: false,
  collagePhotoCount: 4,
  productType: 'custom-wall-watch',
  categoryId: '',
  images: [],
  thumbnail: '',
  frameImage: '',
  variants: [emptyVariant('Circle')],
  isFeatured: false,
  isActive: true,
  slug: '',
  ...emptySeoFormFields,
}

export function AdminWallWatchProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadProducts = () =>
    wallWatchApi
      .adminList()
      .then((payload) => setProducts(payload.items || []))
      .catch((err) => setError(err.message))

  useEffect(() => {
    loadProducts()
    api
      .adminCategories()
      .then((payload) => {
        const items = payload.categories || []
        setCategories(items)
        const wallCat = findWallWatchCategory(items)
        if (wallCat?._id) {
          setForm((prev) => ({ ...prev, categoryId: wallCat._id }))
        }
      })
      .catch(() => setCategories([]))
  }, [])

  const resetForm = () => {
    setForm((prev) => ({ ...emptyForm, categoryId: prev.categoryId }))
    setEditingId('')
  }

  const handleImageUpload = async (event, field = 'images') => {
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
        setForm((prev) => {
          if (field === 'thumbnail') return { ...prev, thumbnail: uploaded[0] }
          if (field === 'frameImage') return { ...prev, frameImage: uploaded[0] }
          return { ...prev, images: [...prev.images, ...uploaded] }
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const updateVariant = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }))
  }

  const addVariant = () =>
    setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant(prev.shape, prev.collageEnabled)] }))

  const removeVariant = (index) =>
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }))

  const selectShape = (shapeId) => {
    setForm((prev) => ({
      ...prev,
      shape: shapeId,
      variants: prev.variants.map((variant) => ({
        ...variant,
        frameType: frameTypeForShape(shapeId, prev.collageEnabled),
      })),
    }))
  }

  const toggleCollage = (enabled) => {
    setForm((prev) => ({
      ...prev,
      collageEnabled: enabled,
      variants: prev.variants.map((variant) => ({
        ...variant,
        frameType: frameTypeForShape(prev.shape, enabled),
      })),
    }))
  }

  const selectCollageCount = (count) => {
    setForm((prev) => ({
      ...prev,
      collageEnabled: true,
      collagePhotoCount: count,
      variants: prev.variants.map((variant) => ({
        ...variant,
        frameType: frameTypeForShape(prev.shape, true),
      })),
    }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.title.trim()) {
      setError('Product title is required.')
      return
    }
    if (!form.categoryId) {
      setError(`"${WALL_WATCH_CATEGORY_LABEL}" category not found. Add it under Admin → Categories first.`)
      return
    }

    const variants = form.variants
      .filter((v) => v.size && v.price !== '')
      .map((v, index) => ({
        sku: v.sku?.trim() || `CWW-${Date.now()}-${index}`,
        size: v.size.trim(),
        material: 'Acrylic',
        frameType: v.frameType?.trim() || form.shape,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice !== '' ? Number(v.compareAtPrice) : undefined,
        stock: Number(v.stock || 50),
        isActive: true,
      }))

    if (!variants.length) {
      setError('Add at least one variant with size and price.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...buildWallWatchAdminPayload(form, variants),
        ...buildSeoPayload(form),
      }

      if (editingId) {
        await wallWatchApi.adminUpdate(editingId, payload)
        setMessage('Wall watch product updated.')
      } else {
        await wallWatchApi.adminCreate(payload)
        setMessage('Wall watch product created.')
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
    const rawShape = product.defaultOptions?.shape || 'Circle'
    const collageEnabled = isCollageWallWatchProduct(product)
    const collagePhotoCount = getCollagePhotoCount(product) || 4
    const shape = resolveWallWatchShape(rawShape)
    setForm({
      title: product.title || '',
      description: product.description || '',
      highlights: (product.highlights || []).join(', '),
      shape,
      collageEnabled,
      collagePhotoCount: collageEnabled ? collagePhotoCount : 4,
      productType: product.productType || 'custom-wall-watch',
      categoryId: findWallWatchCategory(categories)?._id || product.category?._id || product.category || '',
      images: product.images || [],
      thumbnail: product.thumbnail || '',
      frameImage: product.mockup?.frameImage || '',
      variants: (product.variants || []).map((v) => ({
        size: v.size || '',
        frameType: v.frameType || '',
        price: v.price ?? '',
        compareAtPrice: v.compareAtPrice ?? '',
        stock: String(v.stock ?? 50),
        sku: v.sku || '',
        _id: v._id,
      })),
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
      slug: product.slug || '',
      ...seoFieldsFromProduct(product),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id) => {
    if (!window.confirm('Deactivate this wall watch product?')) return
    try {
      await wallWatchApi.adminDelete(id)
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
          <p className="eyebrow">Wall Watches Catalog</p>
          <h1>Custom Wall Watches</h1>
          <p className="admin-page-sub">
            Add photo wall clocks — they appear on{' '}
            <a href={WALL_WATCH_CATALOG_BASE} target="_blank" rel="noreferrer" className="admin-inline-link">
              storefront <FiExternalLink aria-hidden />
            </a>
            . Customers upload photos on the designer page.
          </p>
        </div>
        <div className="admin-stat-grid admin-stat-grid--compact">
          <div className="admin-stat-card">
            <span>Total</span>
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
        <section className="admin-panel admin-catalog-form">
          <div className="admin-panel-toolbar">
            <div>
              <h2>{editingId ? 'Edit wall watch' : 'Add wall watch'}</h2>
              <p className="admin-panel-desc">
                Includes full designer: photo upload, number style/color, clock hands, 3D view, and customize options.
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
                  Title *
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Square Round Acrylic Photo Wall Clock"
                  />
                </label>

                <div className="admin-form-span-2">
                  <p className="admin-field-label">Clock shape * — tick one shape</p>
                  <p className="admin-panel-desc mb-3">
                    Circle, Square Round, and Square — clock numbers 1–12 fit cleanly. Collage works on any of these.
                  </p>
                  <div className="admin-shape-grid">
                    {WALL_WATCH_SHAPE_OPTIONS.map((option) => {
                      const selected = form.shape === option.id
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`admin-shape-card ${selected ? 'is-selected' : ''}`}
                          onClick={() => selectShape(option.id)}
                          aria-pressed={selected}
                        >
                          <span className={`admin-shape-preview admin-shape-preview--${option.preview}`} aria-hidden />
                          <strong>{option.label}</strong>
                          <small>{option.description}</small>
                          {selected ? <span className="admin-shape-check">✓ Selected</span> : null}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="admin-form-span-2">
                  <p className="admin-field-label">Photo collage (optional)</p>
                  <p className="admin-panel-desc mb-3">
                    Enable collage on the selected shape — customers upload 2 to 6 photos on the designer page.
                  </p>
                  <div className="admin-toggle-row mb-3">
                    <AdminSwitchCard
                      label="Enable photo collage"
                      description="Customers upload 2–6 photos on the designer page"
                      checked={form.collageEnabled}
                      onChange={(e) => toggleCollage(e.target.checked)}
                      inputProps={{ 'aria-label': 'Enable photo collage on this shape' }}
                    />
                  </div>
                  {form.collageEnabled && (
                    <div className="admin-collage-count-row">
                      <span className="text-sm font-semibold text-studio-ink">Photos in collage:</span>
                      <div className="admin-collage-count-grid">
                        {WALL_WATCH_COLLAGE_COUNTS.map((count) => {
                          const selected = form.collagePhotoCount === count
                          return (
                            <button
                              key={count}
                              type="button"
                              className={`admin-collage-count-btn ${selected ? 'is-selected' : ''}`}
                              onClick={() => selectCollageCount(count)}
                              aria-pressed={selected}
                            >
                              {count} photos
                            </button>
                          )
                        })}
                      </div>
                      <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        {form.shape} + {form.collagePhotoCount}-photo collage — clock dial hidden, {form.collagePhotoCount} upload slots on designer.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="admin-field-label">Category</p>
                  <div className="admin-field-fixed" aria-readonly="true">
                    <span className="admin-field-fixed__value">{WALL_WATCH_CATEGORY_LABEL}</span>
                    <span className="admin-field-fixed__hint">Fixed for all wall watch products</span>
                  </div>
                </div>
                <label className="admin-form-span-2">
                  Short description
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Personalised wall clock with your favourite photo."
                  />
                </label>
                <label className="admin-form-span-2">
                  Highlights (comma separated)
                  <input
                    value={form.highlights}
                    onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                    placeholder="Silent movement, Photo dial, Gift packaging"
                  />
                </label>
              </div>
            </div>

            <div className="admin-form-section">
              <h3 className="admin-form-section__title">Variants (size & price)</h3>
              {form.variants.map((variant, index) => (
                <div key={variant._id || index} className="admin-form-cols-3 admin-variant-row">
                  <label>
                    Size
                    <input
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      placeholder="10 inch"
                    />
                  </label>
                  <label>
                    Frame type
                    <input
                      value={variant.frameType}
                      onChange={(e) => updateVariant(index, 'frameType', e.target.value)}
                      placeholder="Round"
                    />
                  </label>
                  <label>
                    Price (₹) *
                    <input
                      type="number"
                      min="0"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                    />
                  </label>
                  <label>
                    Compare at (₹)
                    <input
                      type="number"
                      min="0"
                      value={variant.compareAtPrice}
                      onChange={(e) => updateVariant(index, 'compareAtPrice', e.target.value)}
                    />
                  </label>
                  <label>
                    Stock
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                    />
                  </label>
                  <label>
                    SKU
                    <input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      placeholder="Auto-generated if empty"
                    />
                  </label>
                  {form.variants.length > 1 && (
                    <button type="button" className="btn btn-ghost admin-btn-sm" onClick={() => removeVariant(index)}>
                      <FiTrash2 /> Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-ghost admin-btn-sm" onClick={addVariant}>
                <FiPlus /> Add variant
              </button>
            </div>

            <div className="admin-form-section">
              <h3 className="admin-form-section__title">Images</h3>
              <p className="admin-panel-desc">
                Listing/card image (shown on wall watches page). Optional mockup frame for designer overlay.
              </p>
              <div className="admin-image-list">
                {form.images.map((url, index) => (
                  <div className="admin-image-thumb admin-image-thumb-lg" key={`${url}-${index}`}>
                    <img src={resolveMediaUrl(url)} alt="" />
                    <button type="button" onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }))}>
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
              <div className="admin-form-actions admin-form-actions--inline">
                <label className="btn btn-ghost admin-upload-btn">
                  <FiUploadCloud /> {uploading ? 'Uploading…' : 'Upload listing images'}
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => handleImageUpload(e, 'images')} disabled={uploading} />
                </label>
                <label className="btn btn-ghost admin-upload-btn">
                  <FiUploadCloud /> Card thumbnail
                  <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, 'thumbnail')} disabled={uploading} />
                </label>
                <label className="btn btn-ghost admin-upload-btn">
                  <FiUploadCloud /> Mockup frame (optional)
                  <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, 'frameImage')} disabled={uploading} />
                </label>
              </div>
              {(form.thumbnail || form.frameImage) && (
                <div className="admin-form-cols-2">
                  {form.thumbnail && (
                    <div>
                      <small>Card thumbnail</small>
                      <img src={resolveMediaUrl(form.thumbnail)} alt="" className="admin-image-thumb admin-image-thumb-lg" />
                    </div>
                  )}
                  {form.frameImage && (
                    <div>
                      <small>Mockup frame</small>
                      <img src={resolveMediaUrl(form.frameImage)} alt="" className="admin-image-thumb admin-image-thumb-lg" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="admin-form-section admin-seo-section">
              <h3 className="admin-form-section__title">SEO</h3>
              <ProductSeoFields
                form={form}
                setForm={setForm}
                urlPrefix={`${WALL_WATCH_CATALOG_BASE}/`}
                slug={form.slug}
                descriptionField="description"
              />
            </div>

            <div className="admin-form-section admin-form-section--inline">
              <h3 className="admin-form-section__title">Visibility</h3>
              <div className="admin-toggle-row">
                <AdminToggle
                  label="Featured"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                <AdminToggle
                  label="Active on storefront"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              </div>
            </div>

            <div className="admin-form-actions admin-form-actions--sticky">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <FiPlus /> {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create wall watch'}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-panel admin-catalog-list">
          <div className="admin-panel-toolbar">
            <div>
              <h2>All wall watches</h2>
              <p className="admin-panel-desc">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {!products.length ? (
            <div className="admin-catalog-empty">
              <p>No wall watch products yet.</p>
              <span>Use the form above to add your first clock.</span>
            </div>
          ) : (
            <div className="admin-table-wrap admin-table-wrap--rounded">
              <table className="admin-table admin-table--catalog">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Shape</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="admin-table-product">
                          {(product.thumbnail || product.images?.[0]) ? (
                            <img src={resolveMediaUrl(product.thumbnail || product.images[0])} alt="" />
                          ) : (
                            <span className="admin-table-product__placeholder">W</span>
                          )}
                          <div>
                            <strong>{product.title}</strong>
                            <small>{product.slug}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {product.defaultOptions?.shape || '—'}
                        {isCollageWallWatchProduct(product) && (
                          <small className="block text-amber-700">
                            Collage · {getCollagePhotoCount(product) || '?'} photos
                          </small>
                        )}
                      </td>
                      <td>
                        <strong>{formatCurrency(getProductPrice(product))}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${product.isActive ? 'is-success' : 'is-muted'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="admin-actions">
                        <Link
                          to={`${WALL_WATCH_CATALOG_BASE}/${product.slug}`}
                          target="_blank"
                          className="admin-action-btn"
                          title="View storefront"
                        >
                          <FiExternalLink />
                        </Link>
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
