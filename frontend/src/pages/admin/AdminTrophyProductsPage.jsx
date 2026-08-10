import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { api } from '../../services/api'
import { trophyApi } from '../../services/trophyApi'
import { ProductSeoFields } from '../../components/admin/products/ProductSeoFields'
import { formatCurrency } from '../../utils/format'
import { buildSeoPayload, emptySeoFormFields, seoFieldsFromProduct } from '../../utils/productSeoAdmin'

const emptyOption = () => ({ label: '', price: '', compareAtPrice: '', stock: '100' })

const emptyPlaceholders = {
  mainHeading: 'e.g. Employee of the Year',
  recipientName: 'Enter winner name',
  eventName: 'e.g. Annual Awards Night',
  awardDate: 'dd-mm-yyyy',
  organizationName: 'e.g. Company / Club name',
}

const emptyForm = {
  title: '',
  subtitle: 'Celebrate Achievement',
  description: '',
  highlights: '',
  images: [],
  qualityOptions: [emptyOption()],
  fieldPlaceholders: { ...emptyPlaceholders },
  allowLogoUpload: true,
  ratingScore: '4.8',
  reviewCountLabel: '120+ Reviews',
  whatsappNumber: '919098570277',
  isFeatured: false,
  isActive: true,
  sortOrder: '0',
  slug: '',
  ...emptySeoFormFields,
}

export function AdminTrophyProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  const loadProducts = () =>
    trophyApi
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

  const updateOption = (index, key, value) => {
    const next = form.qualityOptions.map((opt, i) => (i === index ? { ...opt, [key]: value } : opt))
    setForm({ ...form, qualityOptions: next })
  }

  const addOption = () => setForm({ ...form, qualityOptions: [...form.qualityOptions, emptyOption()] })

  const removeOption = (index) =>
    setForm({ ...form, qualityOptions: form.qualityOptions.filter((_, i) => i !== index) })

  const updatePlaceholder = (key, value) => {
    setForm({
      ...form,
      fieldPlaceholders: { ...form.fieldPlaceholders, [key]: value },
    })
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const payload = await api.uploadPhoto(file)
      const url = payload.asset?.url
      if (url) setForm((prev) => ({ ...prev, images: [...prev.images, url] }))
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
    try {
      const qualityOptions = form.qualityOptions
        .filter((opt) => opt.label && opt.price !== '')
        .map((opt) => ({
          label: opt.label,
          price: Number(opt.price),
          compareAtPrice: opt.compareAtPrice ? Number(opt.compareAtPrice) : undefined,
          stock: Number(opt.stock || 100),
          isActive: true,
        }))

      if (!qualityOptions.length) {
        setError('Add at least one quality option with label and price')
        return
      }

      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        highlights: form.highlights
          .split(',')
          .map((h) => h.trim())
          .filter(Boolean),
        images: form.images,
        qualityOptions,
        fieldPlaceholders: form.fieldPlaceholders,
        allowLogoUpload: form.allowLogoUpload,
        ratingScore: Number(form.ratingScore || 4.8),
        reviewCountLabel: form.reviewCountLabel,
        whatsappNumber: form.whatsappNumber,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder || 0),
        ...buildSeoPayload(form),
      }

      if (editingId) {
        await trophyApi.adminUpdate(editingId, payload)
        setMessage('Trophy product updated')
      } else {
        await trophyApi.adminCreate(payload)
        setMessage('Trophy product created')
      }
      resetForm()
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = (product) => {
    setEditingId(product._id)
    setForm({
      title: product.title || '',
      subtitle: product.subtitle || 'Celebrate Achievement',
      description: product.description || '',
      highlights: (product.highlights || []).join(', '),
      images: product.images || [],
      qualityOptions: (product.qualityOptions || []).map((opt) => ({
        label: opt.label || '',
        price: opt.price ?? '',
        compareAtPrice: opt.compareAtPrice ?? '',
        stock: opt.stock ?? '100',
        _id: opt._id,
      })),
      fieldPlaceholders: { ...emptyPlaceholders, ...(product.fieldPlaceholders || {}) },
      allowLogoUpload: product.allowLogoUpload !== false,
      ratingScore: String(product.ratingScore ?? 4.8),
      reviewCountLabel: product.reviewCountLabel || '120+ Reviews',
      whatsappNumber: product.whatsappNumber || '919098570277',
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
      sortOrder: String(product.sortOrder ?? 0),
      slug: product.slug || '',
      ...seoFieldsFromProduct(product),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id) => {
    if (!window.confirm('Deactivate this trophy product?')) return
    try {
      await trophyApi.adminDelete(id)
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Trophy Catalog</p>
          <h1>Trophies &amp; Mementos</h1>
        </div>
      </div>

      {error && <p className="form-message">{error}</p>}
      {message && <p className="form-success">{message}</p>}

      <div className="grid grid-cols-1 gap-5">
        <section className="admin-panel">
          <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
          <form className="admin-form sm:grid-cols-2" onSubmit={submit}>
            <label>
              Title
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label>
              Subtitle
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </label>
            <label className="sm:col-span-2">
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="sm:col-span-2">
              Highlights (comma separated)
              <input
                placeholder="Crystal finish, Custom engraving, Gift box"
                value={form.highlights}
                onChange={(e) => setForm({ ...form, highlights: e.target.value })}
              />
            </label>
            <label className="admin-checkbox sm:col-span-2">
              <input
                type="checkbox"
                checked={form.allowLogoUpload}
                onChange={(e) => setForm({ ...form, allowLogoUpload: e.target.checked })}
              />
              Allow customer logo upload
            </label>

            <div className="admin-options-field sm:col-span-2">
              <p>Form field placeholders</p>
              {Object.entries(form.fieldPlaceholders).map(([key, value]) => (
                <label key={key}>
                  {key}
                  <input value={value} onChange={(e) => updatePlaceholder(key, e.target.value)} />
                </label>
              ))}
            </div>

            <div className="admin-image-field sm:col-span-2">
              <p>Product images</p>
              <div className="admin-image-list">
                {form.images.map((url, index) => (
                  <div className="admin-image-thumb" key={url + index}>
                    <img src={url} alt="" />
                    <button type="button" onClick={() => removeImage(index)}>
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
              <label className="btn btn-ghost admin-upload-btn">
                <FiUploadCloud /> {uploading ? 'Uploading…' : 'Upload image'}
                <input type="file" accept="image/*" hidden onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>

            <div className="admin-options-field sm:col-span-2">
              <p>Size / type options</p>
              {form.qualityOptions.map((opt, index) => (
                <div className="admin-option-row" key={opt._id || index}>
                  <input
                    placeholder="Label e.g. 8 inch Standard"
                    value={opt.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Price"
                    value={opt.price}
                    onChange={(e) => updateOption(index, 'price', e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Compare at"
                    value={opt.compareAtPrice}
                    onChange={(e) => updateOption(index, 'compareAtPrice', e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={opt.stock}
                    onChange={(e) => updateOption(index, 'stock', e.target.value)}
                  />
                  <button type="button" onClick={() => removeOption(index)} disabled={form.qualityOptions.length === 1}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost" onClick={addOption}>
                <FiPlus /> Add option
              </button>
            </div>

            <label>
              Rating score (0–5)
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.ratingScore}
                onChange={(e) => setForm({ ...form, ratingScore: e.target.value })}
              />
            </label>
            <label>
              Review count label
              <input
                value={form.reviewCountLabel}
                onChange={(e) => setForm({ ...form, reviewCountLabel: e.target.value })}
              />
            </label>

            <div className="admin-seo-section sm:col-span-2">
              <h3>SEO</h3>
              <ProductSeoFields form={form} setForm={setForm} urlPrefix="/trophies/" slug={form.slug} />
            </div>

            <label>
              Sort order
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </label>
            <label className="admin-checkbox">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              Featured
            </label>
            <label className="admin-checkbox sm:col-span-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>

            <div className="admin-form-actions sm:col-span-2">
              <button className="btn btn-primary" type="submit">
                <FiPlus /> {editingId ? 'Save changes' : 'Create product'}
              </button>
              {editingId && (
                <button className="btn btn-ghost" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-panel">
          <h2>All trophies ({products.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price range</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const prices = (product.qualityOptions || []).map((o) => o.price)
                  const min = prices.length ? Math.min(...prices) : 0
                  const max = prices.length ? Math.max(...prices) : 0
                  return (
                    <tr key={product._id}>
                      <td>
                        <div className="admin-table-product">
                          {product.images?.[0] && <img src={product.images[0]} alt="" />}
                          <div>
                            <strong>{product.title}</strong>
                            <small>{product.slug}</small>
                          </div>
                        </div>
                      </td>
                      <td>{min === max ? formatCurrency(min) : `${formatCurrency(min)} – ${formatCurrency(max)}`}</td>
                      <td>
                        <span className={`status-pill ${product.isActive ? 'is-success' : 'is-muted'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="admin-actions">
                        <button type="button" onClick={() => startEdit(product)}>
                          <FiEdit2 />
                        </button>
                        <button type="button" onClick={() => remove(product._id)}>
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {!products.length && (
                  <tr>
                    <td colSpan={4}>No trophy products yet. Add one from the form.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
