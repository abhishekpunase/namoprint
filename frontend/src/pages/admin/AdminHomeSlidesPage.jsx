import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { api } from '../../services/api'
import { DEFAULT_HOME_SLIDES, HOME_SLIDE_BG_PRESETS } from '../../data/defaultHomeSlides'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { AdminToggle } from '../../components/admin/ui/AdminToggle'

const emptyForm = {
  title: '',
  subtitle: '',
  priceLabel: '',
  backgroundClass: HOME_SLIDE_BG_PRESETS[0].value,
  imageUrl: '',
  linkUrl: '/products',
  buttonLabel: 'Shop Now',
  sortOrder: '0',
  isActive: true,
}

export function AdminHomeSlidesPage() {
  const [slides, setSlides] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadSlides = () =>
    api
      .adminHomeSlides()
      .then((payload) => setSlides(payload.slides || []))
      .catch((err) => setError(err.message))

  useEffect(() => {
    loadSlides()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId('')
  }

  const editSlide = (slide) => {
    setEditingId(slide._id)
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      priceLabel: slide.priceLabel || '',
      backgroundClass: slide.backgroundClass || HOME_SLIDE_BG_PRESETS[0].value,
      imageUrl: slide.imageUrl || '',
      linkUrl: slide.linkUrl || '/products',
      buttonLabel: slide.buttonLabel || 'Shop Now',
      sortOrder: String(slide.sortOrder ?? 0),
      isActive: slide.isActive !== false,
    })
    setMessage('')
    setError('')
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const payload = await api.uploadPhoto(file)
      const url = payload.asset?.url || payload.asset?.optimizedUrl
      if (url) setForm((prev) => ({ ...prev, imageUrl: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
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
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        priceLabel: form.priceLabel.trim(),
        backgroundClass: form.backgroundClass.trim() || HOME_SLIDE_BG_PRESETS[0].value,
        imageUrl: form.imageUrl.trim(),
        linkUrl: form.linkUrl.trim() || '/products',
        buttonLabel: form.buttonLabel.trim() || 'Shop Now',
        sortOrder: Number(form.sortOrder) || 0,
        isActive: Boolean(form.isActive),
      }
      if (!body.title || !body.imageUrl) {
        throw new Error('Title and banner image are required.')
      }
      if (editingId) {
        await api.adminUpdateHomeSlide(editingId, body)
        setMessage('Slide updated.')
      } else {
        await api.adminCreateHomeSlide(body)
        setMessage('Slide added.')
      }
      resetForm()
      loadSlides()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeSlide = async (slide) => {
    if (!window.confirm(`Hide slide "${slide.title.replace(/\n/g, ' ')}" from homepage?`)) return
    try {
      await api.adminDeleteHomeSlide(slide._id)
      if (editingId === slide._id) resetForm()
      loadSlides()
      setMessage('Slide hidden from homepage.')
    } catch (err) {
      setError(err.message)
    }
  }

  const seedDefaults = async () => {
    if (!window.confirm('Add default slides that are not already in the list?')) return
    setSaving(true)
    setError('')
    try {
      let order = slides.length
      for (const slide of DEFAULT_HOME_SLIDES) {
        await api.adminCreateHomeSlide({
          ...slide,
          sortOrder: order,
          isActive: true,
        })
        order += 1
      }
      setMessage('Default slides added.')
      loadSlides()
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
        <h1 className="admin-v2-page-header__title">Home Slider Banners</h1>
        <p className="admin-v2-page-header__description">
          Manage homepage hero slider images, text, and links. Active slides appear in order on the home page.
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
            <h2 className="text-lg font-semibold text-slate-900">Slides ({slides.length})</h2>
            <button type="button" onClick={resetForm} className="admin-btn admin-btn--ghost text-sm">
              <FiPlus className="mr-1 inline" /> New slide
            </button>
          </div>

          {slides.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              <p>No slides yet. Add one or load defaults.</p>
              <button type="button" onClick={seedDefaults} className="admin-btn admin-btn--primary mt-4">
                Load default slides
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {slides.map((slide) => (
                <li
                  key={slide._id}
                  className="flex gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-orange-200"
                >
                  <img
                    src={resolveMediaUrl(slide.imageUrl)}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{slide.title.replace(/\n/g, ' ')}</p>
                    <p className="text-xs text-slate-500">
                      Order {slide.sortOrder ?? 0}
                      {!slide.isActive ? ' · Hidden' : ' · Live'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button type="button" onClick={() => editSlide(slide)} className="admin-btn admin-btn--ghost p-2">
                      <FiEdit2 />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSlide(slide)}
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
            {editingId ? 'Edit slide' : 'Add slide'}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Title *</span>
              <textarea
                rows={2}
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder={'Custom Photo\nWall Clocks'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <span className="text-xs text-slate-400">Use Enter for line break on banner</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Subtitle</span>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Price label</span>
                <input
                  value={form.priceLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, priceLabel: e.target.value }))}
                  placeholder="From ₹499"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Background color</span>
              <select
                value={form.backgroundClass}
                onChange={(e) => setForm((prev) => ({ ...prev, backgroundClass: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {HOME_SLIDE_BG_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Banner image *</span>
              {form.imageUrl ? (
                <img
                  src={resolveMediaUrl(form.imageUrl)}
                  alt="Banner preview"
                  className="h-40 w-full rounded-xl object-cover"
                />
              ) : null}
              <label className="admin-btn admin-btn--secondary inline-flex cursor-pointer items-center gap-2">
                <FiUploadCloud />
                {uploading ? 'Uploading…' : 'Upload image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Button link</span>
                <input
                  value={form.linkUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="/products"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Button text</span>
                <input
                  value={form.buttonLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, buttonLabel: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

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
                {saving ? 'Saving…' : editingId ? 'Update slide' : 'Add slide'}
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
