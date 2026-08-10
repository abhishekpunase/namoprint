import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { productTypes } from '../../../data/fallbackCatalog'
import { slugFromName } from '../../../utils/categoryFormUtils'
import { CategoryImageUploader } from './CategoryImageUploader'

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'seo', label: 'SEO' },
  { id: 'display', label: 'Display' },
]

export function CategoryForm({
  mode = 'create',
  form,
  setForm,
  categories,
  categoryId,
  saving,
  error,
  message,
  uploadingImage,
  uploadImage,
  onSubmit,
}) {
  const [tab, setTab] = useState(0)
  const current = TABS[tab]
  const parentOptions = categories.filter((c) => c._id !== categoryId)

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }))

  return (
    <div className="cat-form">
      <div className="cat-form__head">
        <div>
          <p className="cat-form__eyebrow">{mode === 'edit' ? 'Edit Category' : 'Add Category'}</p>
          <h1>{mode === 'edit' ? form.name || 'Edit category' : 'Create new category'}</h1>
        </div>
        <div className="cat-form__tabs">
          {TABS.map((t, i) => (
            <button key={t.id} type="button" className={`cat-form__tab ${tab === i ? 'is-active' : ''}`} onClick={() => setTab(i)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="cat-alert cat-alert--error">{error}</div>}
      {message && <div className="cat-alert cat-alert--success">{message}</div>}

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="cat-form__panel"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          {current.id === 'basic' && (
            <div className="cat-form-grid">
              <label>
                Category Name *
                <input
                  required
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value, slug: slugFromName(e.target.value) })}
                />
              </label>
              <label>
                Slug
                <input value={form.slug} readOnly placeholder="Auto-generated on save" />
              </label>
              <label>
                Product Type *
                <select value={form.productType} onChange={(e) => update({ productType: e.target.value })}>
                  {productTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Parent Category
                <select value={form.parent} onChange={(e) => update({ parent: e.target.value })}>
                  <option value="">None — top level</option>
                  {parentOptions.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </label>
              <label className="cat-span-2">
                Description
                <textarea value={form.description} onChange={(e) => update({ description: e.target.value })} rows={4} />
              </label>
              <label className="cat-span-2">
                Short Description
                <textarea value={form.shortDescription} onChange={(e) => update({ shortDescription: e.target.value })} rows={2} />
                <span className="cat-todo">TODO: not saved — no API field</span>
              </label>
              <label>
                Display Order
                <input type="number" min="0" value={form.sortOrder} onChange={(e) => update({ sortOrder: e.target.value })} />
              </label>
              <label className="cat-check">
                <input type="checkbox" checked={form.isActive} onChange={(e) => update({ isActive: e.target.checked })} />
                Active
              </label>
              <label className="cat-check">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => update({ isFeatured: e.target.checked })} disabled />
                Featured <span className="cat-todo">TODO API</span>
              </label>
              <div className="cat-span-2">
                <CategoryImageUploader
                  label="Category Image"
                  value={form.imageUrl}
                  onChange={(url) => update({ imageUrl: url })}
                  onUpload={uploadImage}
                  uploading={uploadingImage}
                />
              </div>
              <div className="cat-span-2">
                <CategoryImageUploader
                  label="Banner Image"
                  value={form.bannerUrl}
                  onChange={(url) => update({ bannerUrl: url })}
                  onUpload={uploadImage}
                  uploading={uploadingImage}
                />
                <span className="cat-todo">TODO: banner not persisted — no API field</span>
              </div>
              <label>
                Icon
                <input value={form.icon} onChange={(e) => update({ icon: e.target.value })} placeholder="emoji or icon name" />
                <span className="cat-todo">TODO: icon not persisted</span>
              </label>
            </div>
          )}

          {current.id === 'seo' && (
            <div className="cat-form-grid">
              <label className="cat-span-2">
                Meta Title
                <input value={form.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} />
              </label>
              <label className="cat-span-2">
                Meta Description
                <textarea value={form.seoDescription} onChange={(e) => update({ seoDescription: e.target.value })} rows={3} />
              </label>
              <label className="cat-span-2">
                Keywords
                <input value={form.seoKeywords} onChange={(e) => update({ seoKeywords: e.target.value })} placeholder="comma separated" />
              </label>
              <label>
                Canonical URL
                <input value={form.canonicalUrl} onChange={(e) => update({ canonicalUrl: e.target.value })} />
              </label>
              <label>
                OpenGraph Image
                <input value={form.ogImage} onChange={(e) => update({ ogImage: e.target.value })} placeholder="URL" />
              </label>
              <p className="cat-span-2 cat-todo">SEO fields are preview-only until category SEO API is added.</p>
              <div className="cat-seo-preview cat-span-2">
                <small>Search preview</small>
                <strong>{form.seoTitle || form.name || 'Category title'}</strong>
                <p>{form.seoDescription || form.description || 'Meta description will appear here.'}</p>
              </div>
            </div>
          )}

          {current.id === 'display' && (
            <div className="cat-form-grid">
              <label>
                Category Color
                <input type="color" value={form.categoryColor} onChange={(e) => update({ categoryColor: e.target.value })} />
              </label>
              <label>
                Display Priority
                <input type="number" value={form.sortOrder} onChange={(e) => update({ sortOrder: e.target.value })} />
              </label>
              <label className="cat-check">
                <input type="checkbox" checked={form.homepageVisible} onChange={(e) => update({ homepageVisible: e.target.checked })} />
                Homepage Visibility
              </label>
              <label className="cat-check">
                <input type="checkbox" checked={form.navVisible} onChange={(e) => update({ navVisible: e.target.checked })} />
                Navigation Visibility
              </label>
              <p className="cat-span-2 cat-todo">Display settings are UI-only. Sort order and isActive are saved via existing API.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="cat-form__footer">
        <button type="button" className="cat-btn cat-btn--ghost" disabled={tab <= 0} onClick={() => setTab((t) => Math.max(0, t - 1))}>
          <ChevronLeft size={16} /> Previous
        </button>
        {tab < TABS.length - 1 ? (
          <button type="button" className="cat-btn cat-btn--primary" onClick={() => setTab((t) => Math.min(TABS.length - 1, t + 1))}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" className="cat-btn cat-btn--primary" disabled={saving} onClick={onSubmit}>
            <Save size={16} /> {saving ? 'Saving…' : mode === 'edit' ? 'Save Category' : 'Create Category'}
          </button>
        )}
      </div>
    </div>
  )
}
