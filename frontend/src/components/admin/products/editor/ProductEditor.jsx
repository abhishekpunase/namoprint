import { useMemo, useState } from 'react'
import {
  Box,
  Image as ImageIcon,
  Layers,
  Palette,
  Search,
  Settings,
  Ship,
  Tag,
  Type,
} from 'lucide-react'
import { productTypes } from '../../../../data/fallbackCatalog'
import {
  getCategoryOptionsForProductTypes,
  syncCategoryFromProductType,
  syncProductTypeFromCategory,
} from '../../../../utils/categoryProductTypeSync'
import { analyzeMockupFromUrl, analyzeMockupFile } from '../../../../utils/mockupAnalyzer'
import { MockupEditor } from '../../MockupEditor'
import { VariantManager } from '../VariantManager'
import { CustomizationSection } from '../CustomizationSection'
import { AdvancedImageUploader } from './AdvancedImageUploader'
import { ThumbnailUploader } from './ThumbnailUploader'
import { EditorAccordion } from './EditorAccordion'
import { LayerManagerPanel } from './LayerManagerPanel'
import { SlotManagerPanel } from './SlotManagerPanel'
import { CanvasPreview } from './CanvasPreview'
import { ProductSeoFields } from '../ProductSeoFields'
import { EditorSaveBar } from './EditorSaveBar'
import { MediaLibraryModal } from './MediaLibraryModal'

export function ProductEditor({ editor, mode = 'create', productId }) {
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState('edit')
  const [analyzingFrame, setAnalyzingFrame] = useState(false)

  const {
    form,
    setForm,
    categories,
    saving,
    error,
    message,
    uploadingImage,
    uploadingFrame,
    uploadingThumbnail,
    updateVariant,
    addVariant,
    removeVariant,
    handleImagesUpload,
    removeImage,
    reorderImages,
    replaceImage,
    handleThumbnailUpload,
    removeThumbnail,
    mockupValue,
    handleMockupChange,
    handleFrameUpload,
    loadTemplateOptions,
    updateOptionGroup,
    addOptionGroup,
    removeOptionGroup,
    isDirty,
    autoSaveStatus,
    undo,
    redo,
    canUndo,
    canRedo,
    saveDraft,
    savePublish,
    discardChanges,
    validationErrors,
  } = editor

  const subcategories = categories.filter((c) => c.parent)
  const categoryOptions = useMemo(() => getCategoryOptionsForProductTypes(categories), [categories])

  const handleProductTypeChange = (productType) => {
    setForm({
      ...form,
      productType,
      category: syncCategoryFromProductType(categories, productType, form.category),
      subCategory: '',
    })
  }

  const handleCategoryChange = (categoryId) => {
    setForm({
      ...form,
      category: categoryId,
      productType: syncProductTypeFromCategory(categories, categoryId, form.productType),
      subCategory: '',
    })
  }

  const useImageAsMockupFrame = async (url) => {
    setAnalyzingFrame(true)
    try {
      const analysis = await analyzeMockupFromUrl(url, { forAdmin: true })
      handleMockupChange({
        frameImage: url,
        canvasWidth: String(analysis.canvasWidth),
        canvasHeight: String(analysis.canvasHeight),
        photoBox: analysis.photoBox,
        photoBoxes: analysis.photoBoxes,
        multiSlot: analysis.multiSlot,
        slotCount: analysis.slotCount,
      })
    } catch {
      handleMockupChange({ frameImage: url })
    } finally {
      setAnalyzingFrame(false)
    }
  }

  const handlePreviewFrameUpload = async (file) => {
    setAnalyzingFrame(true)
    try {
      const analysis = await analyzeMockupFile(file, { forAdmin: true })
      handleMockupChange({
        canvasWidth: String(analysis.canvasWidth),
        canvasHeight: String(analysis.canvasHeight),
        photoBox: analysis.photoBox,
        photoBoxes: analysis.photoBoxes,
        multiSlot: analysis.multiSlot,
        slotCount: analysis.slotCount,
      })
      const url = await handleFrameUpload(file)
      if (url) handleMockupChange({ frameImage: url })
    } catch {
      const url = await handleFrameUpload(file)
      if (url) handleMockupChange({ frameImage: url })
    } finally {
      setAnalyzingFrame(false)
    }
  }

  const handlePreviewGalleryUpload = async (files) => {
    await handleImagesUpload(files)
  }

  const sections = [
    {
      id: 'basic',
      label: 'Basic Information',
      icon: <Type size={16} />,
      content: (
        <div className="prod-form-grid">
          <label>Product Name *<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Slug<input value={form.slug} readOnly placeholder="Auto on save" /></label>
          <label>SKU<input value={form.variants?.[0]?.sku || ''} onChange={(e) => updateVariant(0, 'sku', e.target.value)} /></label>
          <label>Barcode<input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="TODO API" /></label>
          <label className="prod-span-2">Highlights<input value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} placeholder="Comma separated" /></label>
          <label className="prod-span-2">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></label>
        </div>
      ),
    },
    {
      id: 'images',
      label: 'Images & Gallery',
      icon: <ImageIcon size={16} />,
      content: (
        <>
          <ThumbnailUploader
            thumbnail={form.thumbnail}
            onUpload={handleThumbnailUpload}
            onRemove={removeThumbnail}
            uploading={uploadingThumbnail}
          />
          <button type="button" className="prod-btn prod-btn--ghost peditor-media-btn" onClick={() => setMediaOpen(true)}>
            Open media library
          </button>
          <p className="peditor-hint">Gallery images are optional extra photos for product details.</p>
          <AdvancedImageUploader
            images={form.images}
            onUpload={handleImagesUpload}
            onRemove={removeImage}
            onReorder={reorderImages}
            onReplace={replaceImage}
            uploading={uploadingImage}
          />
        </>
      ),
    },
    {
      id: 'variants',
      label: 'Variants & Pricing',
      icon: <Tag size={16} />,
      content: <VariantManager variants={form.variants} onUpdate={updateVariant} onAdd={addVariant} onRemove={removeVariant} />,
    },
    {
      id: 'customization',
      label: 'Customization & Mockup',
      icon: <Palette size={16} />,
      content: (
        <>
          <p className="peditor-hint">
            Mockup frame and photo slots are configured in the panel above (under live preview). Set option groups and personalization rules here.
          </p>
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
            hideMockupEditor
          />
          <SlotManagerPanel mockupValue={mockupValue} onMockupChange={handleMockupChange} />
          <LayerManagerPanel form={form} />
        </>
      ),
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Box size={16} />,
      content: (
        <>
          <VariantManager variants={form.variants} onUpdate={updateVariant} onAdd={addVariant} onRemove={removeVariant} />
          <p className="prod-todo">Warehouse, barcode, backorder: TODO extended inventory API</p>
        </>
      ),
    },
    {
      id: 'category',
      label: 'Category & Tags',
      icon: <Layers size={16} />,
      content: (
        <div className="prod-form-grid">
          <label>Product type<select value={form.productType} onChange={(e) => handleProductTypeChange(e.target.value)}>{productTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
          <label>Category *<select required value={form.category || syncCategoryFromProductType(categories, form.productType)} onChange={(e) => handleCategoryChange(e.target.value)}><option value="">Select category</option>{categoryOptions.map((opt) => <option key={opt.productType} value={opt.value}>{opt.label}</option>)}</select></label>
          <label>Subcategory<select value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })}><option value="">None</option>{subcategories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}</select></label>
          <label>Brand<input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></label>
          <label className="prod-span-2">Tags<input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></label>
        </div>
      ),
    },
    {
      id: 'seo',
      label: 'SEO',
      icon: <Search size={16} />,
      content: (
        <ProductSeoFields
          form={form}
          setForm={setForm}
          urlPrefix="/products/"
          slug={form.slug}
        />
      ),
    },
    {
      id: 'shipping',
      label: 'Shipping',
      icon: <Ship size={16} />,
      content: <p className="prod-todo">Shipping dimensions: TODO when schema/API exists</p>,
    },
    {
      id: 'settings',
      label: 'Settings & Visibility',
      icon: <Settings size={16} />,
      content: (
        <div className="prod-form-grid">
          <label className="prod-check prod-span-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Published</label>
          <label className="prod-check prod-span-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
        </div>
      ),
    },
  ]

  return (
    <div className="peditor">
      <header className="peditor__head">
        <div>
          <p className="peditor__eyebrow">{mode === 'edit' ? 'Product Editor' : 'New Product'}</p>
          <h1>{form.title || 'Untitled product'}</h1>
        </div>
        {validationErrors.length > 0 && (
          <div className="peditor-validation">{validationErrors.join(' · ')}</div>
        )}
      </header>

      {error && <div className="prod-alert prod-alert--error">{error}</div>}
      {message && <div className="prod-alert prod-alert--success">{message}</div>}

      <div className="peditor__mobile-tabs">
        <button type="button" className={mobileTab === 'preview' ? 'is-active' : ''} onClick={() => setMobileTab('preview')}>Preview</button>
        <button type="button" className={mobileTab === 'edit' ? 'is-active' : ''} onClick={() => setMobileTab('edit')}>Edit</button>
      </div>

      <div className="peditor__layout peditor__layout--stacked">
        <section className={`peditor__preview-pane ${mobileTab === 'preview' || mobileTab === 'edit' ? 'is-mobile-active' : ''}`}>
          <h2 className="peditor__section-title">Live product preview</h2>
          <CanvasPreview
            form={form}
            mockupValue={mockupValue}
            onUploadImages={handlePreviewGalleryUpload}
            onUploadFrame={handlePreviewFrameUpload}
            uploading={uploadingImage || uploadingFrame}
            analyzing={analyzingFrame}
          />
        </section>

        <section className={`peditor__mockup-pane ${mobileTab === 'edit' ? 'is-mobile-active' : ''}`}>
          <h2 className="peditor__section-title">Mockup & photo slots</h2>
          <p className="peditor-hint peditor__mockup-intro">
            Upload collage frame, auto-detect every blank window, then drag each slot to fit.
          </p>
          <MockupEditor
            value={mockupValue}
            onChange={handleMockupChange}
            onUploadFrame={handleFrameUpload}
            uploading={uploadingFrame}
          />
        </section>

        <div className={`peditor__editor-pane ${mobileTab === 'edit' ? 'is-mobile-active' : ''}`}>
          <h2 className="peditor__section-title">Product details</h2>
          <EditorAccordion sections={sections} defaultOpen="basic" />
        </div>
      </div>

      <EditorSaveBar
        isDirty={isDirty}
        saving={saving}
        autoSaveStatus={autoSaveStatus}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onDiscard={discardChanges}
        onSaveDraft={saveDraft}
        onPublish={savePublish}
      />

      {mediaOpen && (
        <MediaLibraryModal
          images={form.images}
          frameImage={form.frameImage}
          thumbnail={form.thumbnail}
          onClose={() => setMediaOpen(false)}
          onSelect={(url) => setForm({ ...form, images: [...form.images, url] })}
          onUseAsFrame={useImageAsMockupFrame}
          onUseAsThumbnail={(url) => setForm({ ...form, thumbnail: url })}
        />
      )}
      {analyzingFrame && (
        <div className="peditor-analyzing-toast">Detecting photo slots from mockup…</div>
      )}
    </div>
  )
}
