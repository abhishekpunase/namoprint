import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { api } from '../../services/api'
import { DEFAULT_HOME_OFFER_MARQUEE } from '../../data/defaultHomeOfferMarquee'
import { AdminToggle } from '../../components/admin/ui/AdminToggle'

const emptyForm = {
  text: '',
  sortOrder: '0',
  isActive: true,
}

export function AdminHomeOfferMarqueePage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const loadItems = () =>
    api
      .adminHomeOfferMarquee()
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
      text: item.text || '',
      sortOrder: String(item.sortOrder ?? 0),
      isActive: item.isActive !== false,
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
        text: form.text.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: Boolean(form.isActive),
      }
      if (!body.text) throw new Error('Marquee text is required.')
      if (editingId) {
        await api.adminUpdateHomeOfferMarqueeItem(editingId, body)
        setMessage('Marquee line updated.')
      } else {
        await api.adminCreateHomeOfferMarqueeItem(body)
        setMessage('Marquee line added.')
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
    if (!window.confirm(`Hide "${item.text}" from homepage marquee?`)) return
    try {
      await api.adminDeleteHomeOfferMarqueeItem(item._id)
      if (editingId === item._id) resetForm()
      loadItems()
      setMessage('Marquee line hidden from homepage.')
    } catch (err) {
      setError(err.message)
    }
  }

  const seedDefaults = async () => {
    if (!window.confirm('Add default marquee lines that are not already in the list?')) return
    setSaving(true)
    setError('')
    try {
      let order = items.length
      for (const item of DEFAULT_HOME_OFFER_MARQUEE) {
        await api.adminCreateHomeOfferMarqueeItem({
          ...item,
          sortOrder: order,
          isActive: true,
        })
        order += 1
      }
      setMessage('Default marquee lines added.')
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
        <h1 className="admin-v2-page-header__title">Home Offer Marquee</h1>
        <p className="admin-v2-page-header__description">
          Manage the yellow scrolling offer bar on the homepage. Active lines scroll in order.
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
            <h2 className="text-lg font-semibold text-slate-900">Marquee lines ({items.length})</h2>
            <button type="button" onClick={resetForm} className="admin-btn admin-btn--ghost text-sm">
              <FiPlus className="mr-1 inline" /> New line
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              <p>No marquee lines yet.</p>
              <button type="button" onClick={seedDefaults} className="admin-btn admin-btn--primary mt-4">
                Load default lines
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item._id}
                  className="flex gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-yellow-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{item.text}</p>
                    <p className="text-xs text-slate-500">
                      Order {item.sortOrder ?? 0}
                      {!item.isActive ? ' · Hidden' : ' · Live'}
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
            {editingId ? 'Edit marquee line' : 'Add marquee line'}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Text *</span>
              <input
                value={form.text}
                onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                placeholder="Launching offer 10% offer"
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

            <div className="overflow-hidden rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 px-4 py-2 text-sm font-semibold text-gray-900">
              Preview: {form.text.trim() || 'Your marquee text'}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={saving} className="admin-btn admin-btn--primary">
                {saving ? 'Saving…' : editingId ? 'Update line' : 'Add line'}
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
