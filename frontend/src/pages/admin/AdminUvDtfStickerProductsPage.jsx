import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { api } from '../../services/api'
import { uvDtfStickerApi } from '../../services/uvDtfStickerApi'
import { ProductSeoFields } from '../../components/admin/products/ProductSeoFields'
import { formatCurrency } from '../../utils/format'
import { buildSeoPayload, emptySeoFormFields, seoFieldsFromProduct } from '../../utils/productSeoAdmin'

const emptyOption = () => ({ label: '', price: '', compareAtPrice: '', stock: '100' })

const emptyForm = {
  title: '',
  description: '',
  highlights: '',
  images: [],
  qualityOptions: [emptyOption()],
  logoUploadHint: 'Upload your logo image (PNG, JPG, SVG)',
  isFeatured: false,
  isActive: true,
  sortOrder: '0',
  slug: '',
  ...emptySeoFormFields,
}

export function AdminUvDtfStickerProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  const loadProducts = () =>
    uvDtfStickerApi
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
        setError('Add at least one size/pack option with label and price')
        return
      }

      const payload = {
        title: form.title,
        description: form.description,
        highlights: form.highlights
          .split(',')
          .map((h) => h.trim())
          .filter(Boolean),
        images: form.images,
        qualityOptions,
        logoUploadHint: form.logoUploadHint,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder || 0),
        ...buildSeoPayload(form),
      }

      if (editingId) {
        await uvDtfStickerApi.adminUpdate(editingId, payload)
        setMessage('UV DTF sticker product updated')
      } else {
        await uvDtfStickerApi.adminCreate(payload)
        setMessage('UV DTF sticker product created')
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
      logoUploadHint: product.logoUploadHint || 'Upload your logo image (PNG, JPG, SVG)',
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
      sortOrder: String(product.sortOrder ?? 0),
      slug: product.slug || '',
      ...seoFieldsFromProduct(product),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id) => {
    if (!window.confirm('Deactivate this UV DTF sticker product?')) return
    try {
      await uvDtfStickerApi.adminDelete(id)
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">UV DTF Sticker Catalog</p>
          <h1>UV DTF Stickers</h1>
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
              Logo upload hint
              <input
                value={form.logoUploadHint}
                onChange={(e) => setForm({ ...form, logoUploadHint: e.target.value })}
              />
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
                placeholder="UV DTF print, Water resistant, Custom logo"
                value={form.highlights}
                onChange={(e) => setForm({ ...form, highlights: e.target.value })}
              />
            </label>

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
              <p>Size / pack options</p>
              {form.qualityOptions.map((opt, index) => (
                <div className="admin-option-row" key={opt._id || index}>
                  <input
                    placeholder="Label e.g. Small Sheet (10 pcs)"
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

            <div className="admin-seo-section sm:col-span-2">
              <h3>SEO</h3>
              <ProductSeoFields form={form} setForm={setForm} urlPrefix="/uv-dtf-stickers/" slug={form.slug} />
            </div>

            <label>
              Sort order
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </label>
            <label className="admin-checkbox">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              Featured on homepage
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
          <h2>All UV DTF sticker products ({products.length})</h2>
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
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
