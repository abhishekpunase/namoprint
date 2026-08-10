import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiStar, FiTrash2 } from 'react-icons/fi'
import { api } from '../../services/api'
import { AdminToggle } from '../../components/admin/ui/AdminToggle'

const PRODUCT_TYPES = [
  { value: 'general', label: 'General / Store' },
  { value: 'product', label: 'All Products' },
  { value: 'god-product', label: 'God Photo Frame' },
  { value: 'nameplate', label: 'Name Plate' },
  { value: 'tshirt', label: 'T-Shirt Print' },
  { value: 'wall-watch', label: 'Wall Watch' },
  { value: 'corporate-gift', label: 'Corporate Gift' },
]

const emptyForm = {
  customerName: '',
  productTitle: '',
  productSlug: '',
  productType: 'general',
  rating: '5',
  title: '',
  reviewText: '',
  isVerified: false,
  isFeatured: false,
  isPublished: true,
  sortOrder: '0',
}

function StarRating({ value = 5, onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`text-xl ${star <= value ? 'text-amber-400' : 'text-slate-300'} ${readOnly ? 'cursor-default' : 'hover:scale-110'}`}
        >
          <FiStar className={star <= value ? 'fill-current' : ''} />
        </button>
      ))}
    </div>
  )
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')

  const loadReviews = () =>
    api
      .adminReviews()
      .then((payload) => setReviews(payload.reviews || []))
      .catch((err) => setError(err.message))

  useEffect(() => {
    loadReviews()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId('')
  }

  const editReview = (review) => {
    setEditingId(review._id)
    setForm({
      customerName: review.customerName || '',
      productTitle: review.productTitle || '',
      productSlug: review.productSlug || '',
      productType: review.productType || 'general',
      rating: String(review.rating ?? 5),
      title: review.title || '',
      reviewText: review.reviewText || '',
      isVerified: Boolean(review.isVerified),
      isFeatured: Boolean(review.isFeatured),
      isPublished: review.isPublished !== false,
      sortOrder: String(review.sortOrder ?? 0),
    })
    setMessage('')
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const body = {
        customerName: form.customerName.trim(),
        productTitle: form.productTitle.trim(),
        productSlug: form.productSlug.trim(),
        productType: form.productType,
        rating: Number(form.rating) || 5,
        title: form.title.trim(),
        reviewText: form.reviewText.trim(),
        isVerified: Boolean(form.isVerified),
        isFeatured: Boolean(form.isFeatured),
        isPublished: Boolean(form.isPublished),
        sortOrder: Number(form.sortOrder) || 0,
      }
      if (!body.customerName || !body.reviewText) {
        throw new Error('Customer name and review text are required.')
      }
      if (editingId) {
        await api.adminUpdateReview(editingId, body)
        setMessage('Review updated.')
      } else {
        await api.adminCreateReview(body)
        setMessage('Review added.')
      }
      resetForm()
      loadReviews()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeReview = async (review) => {
    if (!window.confirm(`Hide review from "${review.customerName}"?`)) return
    try {
      await api.adminDeleteReview(review._id)
      if (editingId === review._id) resetForm()
      loadReviews()
      setMessage('Review hidden from storefront.')
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = reviews.filter((review) => {
    if (filter === 'published') return review.isPublished !== false
    if (filter === 'featured') return review.isFeatured
    if (filter === 'hidden') return review.isPublished === false
    return true
  })

  return (
    <div className="admin-v2-content__inner space-y-6 p-4 sm:p-6">
      <header className="admin-v2-page-header">
        <p className="admin-v2-page-header__eyebrow">Content</p>
        <h1 className="admin-v2-page-header__title">Customer Reviews</h1>
        <p className="admin-v2-page-header__description">
          Add, edit, and publish product reviews. Featured reviews can be shown on the storefront.
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'published', label: 'Published' },
          { id: 'featured', label: 'Featured' },
          { id: 'hidden', label: 'Hidden' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === item.id ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Reviews ({filtered.length})</h2>
            <button type="button" onClick={resetForm} className="admin-btn admin-btn--ghost text-sm">
              <FiPlus className="mr-1 inline" /> New review
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No reviews in this filter.
            </p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((review) => (
                <li
                  key={review._id}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-violet-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{review.customerName}</p>
                        <StarRating value={review.rating} readOnly />
                      </div>
                      {review.title ? (
                        <p className="mt-1 text-sm font-medium text-slate-800">{review.title}</p>
                      ) : null}
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{review.reviewText}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {review.productTitle || 'General'}
                        {review.isVerified ? ' · Verified' : ''}
                        {review.isFeatured ? ' · Featured' : ''}
                        {review.isPublished === false ? ' · Hidden' : ' · Live'}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => editReview(review)} className="admin-btn admin-btn--ghost p-2">
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeReview(review)}
                        className="admin-btn admin-btn--ghost p-2 text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingId ? 'Edit review' : 'Add review'}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Customer name *</span>
              <input
                value={form.customerName}
                onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Rating *</span>
              <StarRating
                value={Number(form.rating) || 5}
                onChange={(star) => setForm((prev) => ({ ...prev, rating: String(star) }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Review title</span>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Review text *</span>
              <textarea
                rows={4}
                value={form.reviewText}
                onChange={(e) => setForm((prev) => ({ ...prev, reviewText: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Product name</span>
                <input
                  value={form.productTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, productTitle: e.target.value }))}
                  placeholder="Custom Photo Wall Clock"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Product type</span>
                <select
                  value={form.productType}
                  onChange={(e) => setForm((prev) => ({ ...prev, productType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Product slug (optional)</span>
              <input
                value={form.productSlug}
                onChange={(e) => setForm((prev) => ({ ...prev, productSlug: e.target.value }))}
                placeholder="square-round-acrylic-photo-wall-clock"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Sort order</span>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className="w-full max-w-[120px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <AdminToggle
                checked={form.isPublished}
                onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                label="Published on storefront"
              />
              <AdminToggle
                checked={form.isFeatured}
                onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                label="Featured review"
              />
              <AdminToggle
                checked={form.isVerified}
                onChange={(e) => setForm((prev) => ({ ...prev, isVerified: e.target.checked }))}
                label="Verified purchase"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={saving} className="admin-btn admin-btn--primary">
                {saving ? 'Saving…' : editingId ? 'Update review' : 'Add review'}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className="admin-btn admin-btn--ghost">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
