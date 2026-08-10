import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { api } from '../../services/api'
import {
  CATEGORY_PRODUCT_TYPES,
  DEFAULT_CATEGORY_CAROUSEL,
} from '../../data/defaultCategoryCarousel'
import { resolveCategoryLink } from '../../config/categoryRoutes'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { AdminToggle } from '../../components/admin/ui/AdminToggle'

const emptyForm = {
  label: '',
  productType: 'acrylic-wall-photo',
  videoUrl: '',
  posterUrl: '',
  linkUrl: '',
  sortOrder: '0',
  isActive: true,
}

function CirclePreview({ item }) {
  const poster = resolveMediaUrl(item.posterUrl)
  const video = item.videoUrl ? resolveMediaUrl(item.videoUrl) : ''

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-orange-400 bg-white">
      {video ? (
        <video
          src={video}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : null}
      <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  )
}

export function AdminCategoryCarouselPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadItems = () =>
    api
      .adminCategoryCarousel()
      .then((payload) => setItems(payload.items || []))
      .catch((err) => setError(err.message))

  useEffect(() => {
    loadItems()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId('')
  }

  const editItem = (item) => {
    setEditingId(item._id)
    setForm({
      label: item.label || '',
      productType: item.productType || 'acrylic-wall-photo',
      videoUrl: item.videoUrl || '',
      posterUrl: item.posterUrl || '',
      linkUrl: item.linkUrl || '',
      sortOrder: String(item.sortOrder ?? 0),
      isActive: item.isActive !== false,
    })
    setMessage('')
    setError('')
  }

  const handlePosterUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingPoster(true)
    setError('')
    try {
      const payload = await api.uploadPhoto(file)
      const url = payload.asset?.url || payload.asset?.optimizedUrl
      if (url) setForm((prev) => ({ ...prev, posterUrl: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingPoster(false)
      event.target.value = ''
    }
  }

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingVideo(true)
    setError('')
    try {
      const payload = await api.uploadVideo(file)
      const url = payload.asset?.url || payload.asset?.optimizedUrl
      if (url) setForm((prev) => ({ ...prev, videoUrl: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingVideo(false)
      event.target.value = ''
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const productType = form.productType.trim()
      const body = {
        label: form.label.trim(),
        productType,
        videoUrl: form.videoUrl.trim(),
        posterUrl: form.posterUrl.trim(),
        linkUrl: form.linkUrl.trim() || resolveCategoryLink(productType),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: Boolean(form.isActive),
      }
      if (!body.label || !body.posterUrl) {
        throw new Error('Label and poster image are required.')
      }
      if (editingId) {
        await api.adminUpdateCategoryCarouselItem(editingId, body)
        setMessage('Category updated.')
      } else {
        await api.adminCreateCategoryCarouselItem(body)
        setMessage('Category added.')
      }
      resetForm()
      loadItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeItem = async (item) => {
    if (!window.confirm(`Hide "${item.label}" from homepage carousel?`)) return
    try {
      await api.adminDeleteCategoryCarouselItem(item._id)
      if (editingId === item._id) resetForm()
      loadItems()
      setMessage('Category hidden from homepage.')
    } catch (err) {
      setError(err.message)
    }
  }

  const seedDefaults = async () => {
    if (!window.confirm('Add default shop categories that are not already in the list?')) return
    setSaving(true)
    setError('')
    try {
      let order = items.length
      for (const item of DEFAULT_CATEGORY_CAROUSEL) {
        await api.adminCreateCategoryCarouselItem({
          ...item,
          sortOrder: order,
          isActive: true,
        })
        order += 1
      }
      setMessage('Default categories added.')
      loadItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-v2-content__inner space-y-6 p-4 sm:p-6">
      <header className="admin-v2-page-header">
        <p className="admin-v2-page-header__eyebrow">Content</p>
        <h1 className="admin-v2-page-header__title">Shop By Category</h1>
        <p className="admin-v2-page-header__description">
          Manage homepage category circles — video reels, poster images, labels, and product links.
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

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Categories ({items.length})</h2>
            <button type="button" onClick={resetForm} className="admin-btn admin-btn--ghost text-sm">
              <FiPlus className="mr-1 inline" /> New category
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              <p>No categories yet. Add one or load defaults.</p>
              <button type="button" onClick={seedDefaults} className="admin-btn admin-btn--primary mt-4">
                Load default categories
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item._id}
                  className="flex gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-orange-200"
                >
                  <CirclePreview item={item} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">
                      {item.productType} · Order {item.sortOrder ?? 0}
                      {!item.isActive ? ' · Hidden' : ' · Live'}
                      {item.videoUrl ? ' · Video' : ' · Poster only'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button type="button" onClick={() => editItem(item)} className="admin-btn admin-btn--ghost p-2">
                      <FiEdit2 />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      className="admin-btn admin-btn--ghost p-2 text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingId ? 'Edit category' : 'Add category'}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Display label *</span>
              <input
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="Acrylic Wall Clock"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Product type *</span>
              <select
                value={form.productType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    productType: e.target.value,
                    linkUrl: prev.linkUrl || resolveCategoryLink(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {CATEGORY_PRODUCT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Category video</span>
              {form.videoUrl ? (
                <video
                  src={resolveMediaUrl(form.videoUrl)}
                  poster={form.posterUrl ? resolveMediaUrl(form.posterUrl) : undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="mx-auto h-32 w-32 rounded-full object-cover ring-2 ring-orange-300"
                />
              ) : null}
              <label className="admin-btn admin-btn--secondary inline-flex cursor-pointer items-center gap-2">
                <FiUploadCloud />
                {uploadingVideo ? 'Uploading…' : 'Upload video'}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
              </label>
              <input
                value={form.videoUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="Or paste MP4 / WEBM URL"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <span className="text-xs text-slate-400">
                Looping autoplay video inside the circle. Upload MP4/WEBM/MOV (max 50 MB) or paste a URL. Leave empty to show poster only.
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Poster image *</span>
              {form.posterUrl ? (
                <img
                  src={resolveMediaUrl(form.posterUrl)}
                  alt="Poster preview"
                  className="mx-auto h-32 w-32 rounded-full object-cover ring-2 ring-orange-300"
                />
              ) : null}
              <label className="admin-btn admin-btn--secondary inline-flex cursor-pointer items-center gap-2">
                <FiUploadCloud />
                {uploadingPoster ? 'Uploading…' : 'Upload poster'}
                <input type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} />
              </label>
              <input
                value={form.posterUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, posterUrl: e.target.value }))}
                placeholder="Or paste image URL"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Link URL</span>
              <input
                value={form.linkUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
                placeholder={resolveCategoryLink(form.productType)}
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

            <AdminToggle
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              label="Show on homepage"
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={saving} className="admin-btn admin-btn--primary">
                {saving ? 'Saving…' : editingId ? 'Update category' : 'Add category'}
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
