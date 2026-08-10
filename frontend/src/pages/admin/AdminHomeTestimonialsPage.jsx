import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { api } from '../../services/api'
import {
  DEFAULT_HOME_TESTIMONIALS,
  DEFAULT_HOME_TESTIMONIAL_SECTION,
} from '../../data/defaultHomeTestimonials'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { AdminToggle } from '../../components/admin/ui/AdminToggle'

const emptySectionForm = {
  badge: DEFAULT_HOME_TESTIMONIAL_SECTION.badge,
  heading: DEFAULT_HOME_TESTIMONIAL_SECTION.heading,
  subtitle: DEFAULT_HOME_TESTIMONIAL_SECTION.subtitle,
}

const emptyForm = {
  name: '',
  role: 'Verified Customer',
  imageUrl: '',
  title: '',
  review: '',
  rating: '5',
  sortOrder: '0',
  isActive: true,
}

export function AdminHomeTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [sectionForm, setSectionForm] = useState(emptySectionForm)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingSection, setSavingSection] = useState(false)

  const loadData = () =>
    api
      .adminHomeTestimonials()
      .then((payload) => {
        setTestimonials(payload.testimonials || [])
        if (payload.section) {
          setSectionForm({
            badge: payload.section.badge || emptySectionForm.badge,
            heading: payload.section.heading || emptySectionForm.heading,
            subtitle: payload.section.subtitle || emptySectionForm.subtitle,
          })
        }
      })
      .catch((err) => setError(err.message))

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId('')
  }

  const editTestimonial = (item) => {
    setEditingId(item._id)
    setForm({
      name: item.name || '',
      role: item.role || 'Verified Customer',
      imageUrl: item.imageUrl || '',
      title: item.title || '',
      review: item.review || '',
      rating: String(item.rating ?? 5),
      sortOrder: String(item.sortOrder ?? 0),
      isActive: item.isActive !== false,
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

  const saveSection = async (event) => {
    event.preventDefault()
    setSavingSection(true)
    setError('')
    setMessage('')
    try {
      await api.adminUpdateHomeTestimonialSection({
        badge: sectionForm.badge.trim(),
        heading: sectionForm.heading.trim(),
        subtitle: sectionForm.subtitle.trim(),
      })
      setMessage('Section heading updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingSection(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const body = {
        name: form.name.trim(),
        role: form.role.trim() || 'Verified Customer',
        imageUrl: form.imageUrl.trim(),
        title: form.title.trim(),
        review: form.review.trim(),
        rating: Number(form.rating) || 5,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: Boolean(form.isActive),
      }
      if (!body.name || !body.imageUrl || !body.title || !body.review) {
        throw new Error('Name, photo, title, and review are required.')
      }
      if (editingId) {
        await api.adminUpdateHomeTestimonial(editingId, body)
        setMessage('Testimonial updated.')
      } else {
        await api.adminCreateHomeTestimonial(body)
        setMessage('Testimonial added.')
      }
      resetForm()
      loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeTestimonial = async (item) => {
    if (!window.confirm(`Hide testimonial from "${item.name}" on homepage?`)) return
    try {
      await api.adminDeleteHomeTestimonial(item._id)
      if (editingId === item._id) resetForm()
      loadData()
      setMessage('Testimonial hidden from homepage.')
    } catch (err) {
      setError(err.message)
    }
  }

  const seedDefaults = async () => {
    if (!window.confirm('Add default testimonials that are not already in the list?')) return
    setSaving(true)
    setError('')
    try {
      let order = testimonials.length
      for (const item of DEFAULT_HOME_TESTIMONIALS) {
        await api.adminCreateHomeTestimonial({
          ...item,
          sortOrder: order,
          isActive: true,
        })
        order += 1
      }
      setMessage('Default testimonials added.')
      loadData()
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
        <h1 className="admin-v2-page-header__title">Home Testimonials</h1>
        <p className="admin-v2-page-header__description">
          Manage the customer testimonials carousel on the homepage — section heading and individual reviews.
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Section heading</h2>
        <form onSubmit={saveSection} className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Badge</span>
            <input
              value={sectionForm.badge}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, badge: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1 lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Main heading</span>
            <textarea
              rows={2}
              value={sectionForm.heading}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, heading: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <span className="text-xs text-slate-400">Use Enter for line break</span>
          </label>
          <label className="block space-y-1 lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Subtitle</span>
            <textarea
              rows={2}
              value={sectionForm.subtitle}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <div>
            <button type="submit" disabled={savingSection} className="admin-btn admin-btn--primary">
              {savingSection ? 'Saving…' : 'Save section heading'}
            </button>
          </div>
        </form>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Testimonials ({testimonials.length})</h2>
            <button type="button" onClick={resetForm} className="admin-btn admin-btn--ghost text-sm">
              <FiPlus className="mr-1 inline" /> New testimonial
            </button>
          </div>

          {testimonials.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              <p>No testimonials yet. Add one or load defaults.</p>
              <button type="button" onClick={seedDefaults} className="admin-btn admin-btn--primary mt-4">
                Load default testimonials
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {testimonials.map((item) => (
                <li
                  key={item._id}
                  className="flex gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-orange-200"
                >
                  <img
                    src={resolveMediaUrl(item.imageUrl)}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-full border-2 border-orange-300 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{item.title}</p>
                    <p className="truncate text-sm text-slate-600">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      Order {item.sortOrder ?? 0}
                      {!item.isActive ? ' · Hidden' : ' · Live'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => editTestimonial(item)}
                      className="admin-btn admin-btn--ghost p-2"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTestimonial(item)}
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
            {editingId ? 'Edit testimonial' : 'Add testimonial'}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Review title *</span>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Highly Recommended"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Review text *</span>
              <textarea
                rows={4}
                value={form.review}
                onChange={(e) => setForm((prev) => ({ ...prev, review: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Customer name *</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Role / label</span>
                <input
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="Verified Customer"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Customer photo *</span>
              {form.imageUrl ? (
                <img
                  src={resolveMediaUrl(form.imageUrl)}
                  alt="Customer preview"
                  className="h-24 w-24 rounded-full border-2 border-orange-300 object-cover"
                />
              ) : null}
              <label className="admin-btn admin-btn--secondary inline-flex cursor-pointer items-center gap-2">
                <FiUploadCloud />
                {uploading ? 'Uploading…' : 'Upload photo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Star rating</span>
                <select
                  value={form.rating}
                  onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Sort order</span>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <AdminToggle
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              label="Show on homepage"
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={saving} className="admin-btn admin-btn--primary">
                {saving ? 'Saving…' : editingId ? 'Update testimonial' : 'Add testimonial'}
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
