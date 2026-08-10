import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { api } from '../../services/api'
import { namePlateApi } from '../../services/namePlateApi'
import { ProductSeoFields } from '../../components/admin/products/ProductSeoFields'
import { formatCurrency } from '../../utils/format'
import { buildSeoPayload, emptySeoFormFields, seoFieldsFromProduct } from '../../utils/productSeoAdmin'

const ORDER_STATUSES = ['New', 'Contacted', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

const emptyOption = () => ({ label: '', price: '', compareAtPrice: '', stock: '100' })

const emptyForm = {
  title: '',
  description: '',
  highlights: '',
  images: [],
  qualityOptions: [emptyOption()],
  headingPlaceholder: 'e.g. The Sharma Family',
  subTextPlaceholder: 'e.g. House No. 24, Green Park',
  isFeatured: false,
  isActive: true,
  sortOrder: '0',
  slug: '',
  ...emptySeoFormFields,
}

export function AdminNamePlateProductsPage() {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  const loadProducts = () =>
    namePlateApi
      .adminList()
      .then((payload) => setProducts(payload.items || []))
      .catch((err) => setError(err.message))

  const loadOrders = () =>
    namePlateApi
      .adminOrders()
      .then((payload) => setOrders(payload.orders || []))
      .catch((err) => setError(err.message))

  useEffect(() => {
    loadProducts()
    loadOrders()
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
        setError('Add at least one quality option with label and price')
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
        headingPlaceholder: form.headingPlaceholder,
        subTextPlaceholder: form.subTextPlaceholder,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder || 0),
        ...buildSeoPayload(form),
      }

      if (editingId) {
        await namePlateApi.adminUpdate(editingId, payload)
        setMessage('Name plate updated')
      } else {
        await namePlateApi.adminCreate(payload)
        setMessage('Name plate created')
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
      headingPlaceholder: product.headingPlaceholder || 'e.g. The Sharma Family',
      subTextPlaceholder: product.subTextPlaceholder || 'e.g. House No. 24, Green Park',
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
      sortOrder: String(product.sortOrder ?? 0),
      slug: product.slug || '',
      ...seoFieldsFromProduct(product),
    })
    setTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id) => {
    if (!window.confirm('Deactivate this name plate?')) return
    try {
      await namePlateApi.adminDelete(id)
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    setMessage('')
    try {
      await namePlateApi.adminUpdateOrderStatus(orderId, { status })
      setMessage('Order status updated')
      loadOrders()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Name Plate Catalog</p>
          <h1>Name Plates</h1>
        </div>
        <div className="admin-tabs">
          <button type="button" className={tab === 'products' ? 'is-active' : ''} onClick={() => setTab('products')}>
            Products ({products.length})
          </button>
          <button type="button" className={tab === 'orders' ? 'is-active' : ''} onClick={() => setTab('orders')}>
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {error && <p className="form-message">{error}</p>}
      {message && <p className="form-success">{message}</p>}

      {tab === 'products' && (
        <div className="admin-split admin-split-form">
          <section className="admin-panel">
            <h2>{editingId ? 'Edit name plate' : 'Add name plate'}</h2>
            <form className="admin-form" onSubmit={submit}>
              <label>
                Title
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              <label>
                Highlights (comma separated)
                <input
                  placeholder="Rust-proof, Weather resistant, Laser engraved"
                  value={form.highlights}
                  onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                />
              </label>
              <label>
                Heading placeholder text
                <input
                  value={form.headingPlaceholder}
                  onChange={(e) => setForm({ ...form, headingPlaceholder: e.target.value })}
                />
              </label>
              <label>
                Sub-text placeholder text
                <input
                  value={form.subTextPlaceholder}
                  onChange={(e) => setForm({ ...form, subTextPlaceholder: e.target.value })}
                />
              </label>

              <div className="admin-image-field">
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

              <div className="admin-options-field">
                <p>Quality / size options</p>
                {form.qualityOptions.map((opt, index) => (
                  <div className="admin-option-row" key={opt._id || index}>
                    <input
                      placeholder="Label e.g. 12x5 inch - Golden Acrylic"
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
                      placeholder="Compare at (optional)"
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

              <div className="admin-seo-section">
                <h3>SEO</h3>
                <ProductSeoFields form={form} setForm={setForm} urlPrefix="/name-plates/" slug={form.slug} />
              </div>

              <label>
                Sort order
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </label>
              <label className="admin-checkbox">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Featured on homepage
              </label>
              <label className="admin-checkbox">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>

              <div className="admin-form-actions">
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

          <section className="admin-panel admin-panel-wide">
            <h2>All name plates ({products.length})</h2>
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
                      <td colSpan={4}>No name plates yet. Add one from the form.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {tab === 'orders' && (
        <section className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Plate text</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>{order.productTitle}</strong>
                      <small>{order.qualityLabel}</small>
                    </td>
                    <td>
                      <strong>{order.headingText}</strong>
                      {order.subText && <small>{order.subText}</small>}
                    </td>
                    <td>
                      {order.customerName}
                      <small>{order.phone}</small>
                    </td>
                    <td>{order.quantity}</td>
                    <td>{formatCurrency(order.totalPrice)}</td>
                    <td>
                      <span className="status-pill">{order.status}</span>
                    </td>
                    <td>
                      <select defaultValue={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td colSpan={7}>No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
