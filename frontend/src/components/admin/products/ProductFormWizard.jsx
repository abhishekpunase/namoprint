import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { productTypes } from '../../../data/fallbackCatalog'
import { ImageUploader } from './ImageUploader'
import { VariantManager } from './VariantManager'
import { CustomizationSection } from './CustomizationSection'

const STEPS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'category', label: 'Category' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'images', label: 'Images' },
  { id: 'seo', label: 'SEO' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'visibility', label: 'Visibility' },
  { id: 'customization', label: 'Customization' },
]

export function ProductFormWizard({
  mode = 'create',
  form,
  setForm,
  categories,
  saving,
  error,
  message,
  uploadingImage,
  uploadingFrame,
  onSubmit,
  updateVariant,
  addVariant,
  removeVariant,
  handleImagesUpload,
  removeImage,
  reorderImages,
  mockupValue,
  handleMockupChange,
  handleFrameUpload,
  loadTemplateOptions,
  updateOptionGroup,
  addOptionGroup,
  removeOptionGroup,
}) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const subcategories = categories.filter((c) => c.parent)
  const topCategories = categories.filter((c) => !c.parent)

  return (
    <div className="prod-wizard">
      <div className="prod-wizard__head">
        <div>
          <p className="prod-wizard__eyebrow">{mode === 'edit' ? 'Edit Product' : 'Add Product'}</p>
          <h1>{mode === 'edit' ? form.title || 'Edit product' : 'Create new product'}</h1>
          {form.slug ? <small>/{form.slug}</small> : null}
        </div>
        <button type="button" className="prod-btn prod-btn--primary" onClick={onSubmit} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Publish product'}
        </button>
      </div>

      {error ? <p className="prod-alert prod-alert--error">{error}</p> : null}
      {message ? <p className="prod-alert prod-alert--success">{message}</p> : null}

      <nav className="prod-wizard__steps" aria-label="Product form steps">
        {STEPS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`prod-wizard__step ${index === step ? 'is-active' : ''} ${index < step ? 'is-done' : ''}`}
            onClick={() => setStep(index)}
          >
            <span>{index + 1}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="prod-wizard__panel"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          {current.id === 'basic' && (
            <div className="prod-form-grid">
              <label>
                Product Name *
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label>
                Slug
                <input value={form.slug} readOnly placeholder="Auto-generated from title" />
              </label>
              <label>
                SKU
                <input value={form.variants?.[0]?.sku || ''} onChange={(e) => updateVariant(0, 'sku', e.target.value)} placeholder="Optional — first variant SKU" />
              </label>
              <label>
                Barcode
                <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="TODO: stored when barcode API exists" />
              </label>
              <label className="prod-span-2">
                Short description / highlights
                <input value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} placeholder="Comma separated highlights" />
              </label>
              <label className="prod-span-2">
                Full description
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} />
              </label>
            </div>
          )}

          {current.id === 'category' && (
            <div className="prod-form-grid">
              <label>
                Product type *
                <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}>
                  {productTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Category *
                <select
                  required
                  value={form.category}
                  onChange={(e) => {
                    const cat = categories.find((c) => c._id === e.target.value)
                    setForm({ ...form, category: e.target.value, productType: cat?.productType || form.productType })
                  }}
                >
                  <option value="">Select category</option>
                  {topCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Subcategory
                <select value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })}>
                  <option value="">None</option>
                  {subcategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Brand
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </label>
              <label className="prod-span-2">
                Tags
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Comma separated tags" />
              </label>
              <p className="prod-todo prod-span-2">Collections: TODO when collections API is available</p>
            </div>
          )}

          {current.id === 'pricing' && (
            <VariantManager
              variants={form.variants}
              onUpdate={updateVariant}
              onAdd={addVariant}
              onRemove={removeVariant}
            />
          )}

          {current.id === 'inventory' && (
            <div className="prod-form-grid">
              <p className="prod-span-2 prod-subpanel__hint">Inventory is managed per variant. Update stock levels below.</p>
              <VariantManager variants={form.variants} onUpdate={updateVariant} onAdd={addVariant} onRemove={removeVariant} />
              <p className="prod-todo prod-span-2">Warehouse, backorders, min/max stock: TODO extended inventory API</p>
            </div>
          )}

          {current.id === 'images' && (
            <ImageUploader
              images={form.images}
              onUpload={handleImagesUpload}
              onRemove={removeImage}
              onReorder={reorderImages}
              uploading={uploadingImage}
            />
          )}

          {current.id === 'seo' && (
            <div className="prod-form-grid">
              <label className="prod-span-2">
                Meta title
                <input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
              </label>
              <label className="prod-span-2">
                Meta description
                <textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} rows={3} />
              </label>
              <label className="prod-span-2">
                Keywords
                <input value={form.seoKeywords} onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })} placeholder="Comma separated" />
              </label>
              <div className="prod-seo-preview prod-span-2">
                <small>URL preview</small>
                <strong>{form.slug ? `/products/${form.slug}` : '/products/your-product-slug'}</strong>
                <p>{form.seoDescription || form.description || 'Meta description preview…'}</p>
              </div>
              <p className="prod-todo prod-span-2">OpenGraph image: TODO dedicated SEO media field</p>
            </div>
          )}

          {current.id === 'shipping' && (
            <div className="prod-form-grid">
              <p className="prod-todo prod-span-2">Shipping dimensions & class are UI placeholders until shipping schema/API exists.</p>
              <label>Weight (kg)<input disabled placeholder="TODO" /></label>
              <label>Length (cm)<input disabled placeholder="TODO" /></label>
              <label>Width (cm)<input disabled placeholder="TODO" /></label>
              <label>Height (cm)<input disabled placeholder="TODO" /></label>
              <label className="prod-span-2">Shipping class<input disabled placeholder="TODO" /></label>
            </div>
          )}

          {current.id === 'visibility' && (
            <div className="prod-form-grid">
              <label className="prod-check prod-span-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Published (visible in storefront)
              </label>
              <label className="prod-check prod-span-2">
                <input type="checkbox" checked={!form.isActive} onChange={(e) => setForm({ ...form, isActive: !e.target.checked })} />
                Draft / hidden
              </label>
              <label className="prod-check prod-span-2">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Featured on homepage
              </label>
              <p className="prod-todo prod-span-2">Best seller flag: TODO when analytics API exists</p>
            </div>
          )}

          {current.id === 'customization' && (
            <CustomizationSection
              form={form}
              setForm={setForm}
              mockupValue={mockupValue}
              onMockupChange={handleMockupChange}
              onUploadFrame={handleFrameUpload}
              uploadingFrame={uploadingFrame}
              onLoadTemplate={loadTemplateOptions}
              onUpdateOptionGroup={updateOptionGroup}
              onAddOptionGroup={addOptionGroup}
              onRemoveOptionGroup={removeOptionGroup}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="prod-wizard__footer">
        <button type="button" className="prod-btn prod-btn--ghost" onClick={prev} disabled={step === 0}>
          <ChevronLeft size={16} /> Previous
        </button>
        <span>
          Step {step + 1} of {STEPS.length}
        </span>
        {step < STEPS.length - 1 ? (
          <button type="button" className="prod-btn prod-btn--primary" onClick={next}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" className="prod-btn prod-btn--primary" onClick={onSubmit} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save product'}
          </button>
        )}
      </div>
    </div>
  )
}
