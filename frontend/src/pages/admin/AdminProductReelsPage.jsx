import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { api } from '../../services/api'
import { DEFAULT_PRODUCT_REELS } from '../../data/defaultProductReels'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { AdminToggle } from '../../components/admin/ui/AdminToggle'

const emptyForm = {
  categoryLabel: 'Acrylic',
  productName: '',
  priceLabel: '',
  likesLabel: '0',
  videoUrl: '',
  posterUrl: '',
  linkUrl: '',
  sortOrder: '0',
  isActive: true,
}

function ReelPreview({ reel }) {
  const video = reel.videoUrl ? resolveMediaUrl(reel.videoUrl) : ''
  const poster = reel.posterUrl ? resolveMediaUrl(reel.posterUrl) : ''

  return (
    <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-900">
      {video ? (
        <video
          src={video}
          poster={poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
      ) : poster ? (
        <img src={poster} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-slate-400">No video</div>
      )}
    </div>
  )
}

export function AdminProductReelsPage() {
  const [reels, setReels] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadReels = () =>
    api
      .adminProductReels()
      .then((payload) => setReels(payload.reels || []))
      .catch((err) => setError(err.message))

  useEffect(() => {
    loadReels()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId('')
  }

  const editReel = (reel) => {
    setEditingId(reel._id)
    setForm({
      categoryLabel: reel.categoryLabel || 'Acrylic',
      productName: reel.productName || '',
      priceLabel: reel.priceLabel || '',
      likesLabel: reel.likesLabel || '0',
      videoUrl: reel.videoUrl || '',
      posterUrl: reel.posterUrl || '',
      linkUrl: reel.linkUrl || '',
      sortOrder: String(reel.sortOrder ?? 0),
      isActive: reel.isActive !== false,
    })
    setMessage('')
    setError('')
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

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const body = {
        categoryLabel: form.categoryLabel.trim() || 'Acrylic',
        productName: form.productName.trim(),
        priceLabel: form.priceLabel.trim(),
        likesLabel: form.likesLabel.trim() || '0',
        videoUrl: form.videoUrl.trim(),
        posterUrl: form.posterUrl.trim(),
        linkUrl: form.linkUrl.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: Boolean(form.isActive),
      }
      if (!body.productName || !body.videoUrl) {
        throw new Error('Product name and video are required.')
      }
      if (editingId) {
        await api.adminUpdateProductReel(editingId, body)
        setMessage('Reel updated.')
      } else {
        await api.adminCreateProductReel(body)
        setMessage('Reel added.')
      }
      resetForm()
      loadReels()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeReel = async (reel) => {
    if (!window.confirm(`Hide reel "${reel.productName}" from homepage?`)) return
    try {
      await api.adminDeleteProductReel(reel._id)
      if (editingId === reel._id) resetForm()
      loadReels()
      setMessage('Reel hidden from homepage.')
    } catch (err) {
      setError(err.message)
    }
  }

  const seedDefaults = async () => {
    if (!window.confirm('Add default product reels that are not already in the list?')) return
    setSaving(true)
    setError('')
    try {
      let order = reels.length
      for (const reel of DEFAULT_PRODUCT_REELS) {
        await api.adminCreateProductReel({
          ...reel,
          sortOrder: order,
          isActive: true,
        })
        order += 1
      }
      setMessage('Default reels added.')
      loadReels()
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
        <h1 className="admin-v2-page-header__title">Product Reels</h1>
        <p className="admin-v2-page-header__description">
          Manage homepage product reel videos — upload MP4 or paste URL, set product name, price, and likes.
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
            <h2 className="text-lg font-semibold text-slate-900">Reels ({reels.length})</h2>
            <button type="button" onClick={resetForm} className="admin-btn admin-btn--ghost text-sm">
              <FiPlus className="mr-1 inline" /> New reel
            </button>
          </div>

          {reels.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              <p>No reels yet. Add one or load defaults.</p>
              <button type="button" onClick={seedDefaults} className="admin-btn admin-btn--primary mt-4">
                Load default reels
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {reels.map((reel) => (
                <li
                  key={reel._id}
                  className="flex gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-orange-200"
                >
                  <ReelPreview reel={reel} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{reel.productName}</p>
                    <p className="text-xs text-slate-500">
                      {reel.priceLabel || 'No price'} · {reel.likesLabel || '0'} likes · Order {reel.sortOrder ?? 0}
                      {!reel.isActive ? ' · Hidden' : ' · Live'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button type="button" onClick={() => editReel(reel)} className="admin-btn admin-btn--ghost p-2">
                      <FiEdit2 />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeReel(reel)}
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
            {editingId ? 'Edit reel' : 'Add reel'}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Category label</span>
                <input
                  value={form.categoryLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryLabel: e.target.value }))}
                  placeholder="Acrylic"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Product name *</span>
                <input
                  value={form.productName}
                  onChange={(e) => setForm((prev) => ({ ...prev, productName: e.target.value }))}
                  placeholder="Baby Frame"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Price label</span>
                <input
                  value={form.priceLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, priceLabel: e.target.value }))}
                  placeholder="₹399"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Likes label</span>
                <input
                  value={form.likesLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, likesLabel: e.target.value }))}
                  placeholder="298"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Reel video *</span>
              {form.videoUrl ? (
                <video
                  src={resolveMediaUrl(form.videoUrl)}
                  poster={form.posterUrl ? resolveMediaUrl(form.posterUrl) : undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-48 w-full rounded-xl object-cover"
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
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Poster image (optional)</span>
              {form.posterUrl ? (
                <img
                  src={resolveMediaUrl(form.posterUrl)}
                  alt="Poster preview"
                  className="h-32 w-full rounded-xl object-cover"
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
                placeholder="Or paste poster URL"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Product link</span>
              <input
                value={form.linkUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
                placeholder="/products"
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
                {saving ? 'Saving…' : editingId ? 'Update reel' : 'Add reel'}
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
