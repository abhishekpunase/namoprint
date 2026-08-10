import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { getCustomizationTemplate } from '../data/customizationTemplates'
import { findAdminProductById, isCatalogDemoProduct, loadAdminProductCatalog } from '../utils/adminProductCatalog'
import { buildProductPayload, emptyForm, emptyVariant, productToForm } from '../utils/productFormUtils'
import { analysisToFormPatch } from '../utils/enrichProductMockup'
import { analyzeMockupFromUrl } from '../utils/mockupAnalyzer'
import {
  findParentCategory,
  isFallbackCategoryId,
  productTypeFromFallbackCategoryId,
  syncCategoryFromProductType,
} from '../utils/categoryProductTypeSync'
import { productTypes } from '../data/fallbackCatalog'

export function useProductForm({ productId, onSaved }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(Boolean(productId))
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingFrame, setUploadingFrame] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadCategories = useCallback(async () => {
    const payload = await api.adminCategories()
    const list = payload.categories || []
    setCategories(list)
    return list
  }, [])

  useEffect(() => {
    if (!categories.length || form.category) return
    const categoryId = syncCategoryFromProductType(categories, form.productType)
    if (categoryId) {
      setForm((prev) => ({ ...prev, category: categoryId }))
    }
  }, [categories, form.productType, form.category])

  const loadProduct = useCallback(async (id) => {
    setLoading(true)
    setError('')
    try {
      const [catalog, cats] = await Promise.all([loadAdminProductCatalog(), loadCategories()])
      const product = findAdminProductById(id, catalog)
      if (!product) throw new Error('Product not found')
      setForm(productToForm(product))
      if (!cats.length) await loadCategories()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [loadCategories])

  const updateVariant = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    }))
  }

  const addVariant = () => setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))
  const removeVariant = (index) =>
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }))

  const handleImagesUpload = async (files) => {
    if (!files?.length) return
    setUploadingImage(true)
    setError('')
    try {
      for (const file of files) {
        const payload = await api.uploadPhoto(file)
        const url = payload.asset?.url
        if (url) setForm((prev) => ({ ...prev, images: [...prev.images, url] }))
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))

  const reorderImages = (fromIndex, toIndex) => {
    setForm((prev) => {
      const next = [...prev.images]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { ...prev, images: next }
    })
  }

  const replaceImage = async (index, blob) => {
    setUploadingImage(true)
    setError('')
    try {
      const file = new File([blob], 'edited.jpg', { type: blob.type || 'image/jpeg' })
      const payload = await api.uploadPhoto(file)
      const url = payload.asset?.url
      if (url) {
        setForm((prev) => {
          const next = [...prev.images]
          next[index] = url
          return { ...prev, images: next }
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleThumbnailUpload = async (file) => {
    if (!file) return
    setUploadingThumbnail(true)
    setError('')
    try {
      const payload = await api.uploadPhoto(file)
      const url = payload.asset?.url
      if (url) setForm((prev) => ({ ...prev, thumbnail: url }))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const removeThumbnail = () => setForm((prev) => ({ ...prev, thumbnail: '' }))

  const handleFrameUpload = async (file) => {
    setUploadingFrame(true)
    setError('')
    try {
      const payload = await api.uploadPhoto(file)
      return payload.asset?.url || ''
    } catch (err) {
      setError(err.message)
      return ''
    } finally {
      setUploadingFrame(false)
    }
  }

  const mockupValue = useMemo(
    () => ({
      canvasWidth: form.canvasWidth,
      canvasHeight: form.canvasHeight,
      frameImage: form.frameImage,
      photoBox: {
        x: Number(form.boxX || 0),
        y: Number(form.boxY || 0),
        width: Number(form.boxWidth || 0),
        height: Number(form.boxHeight || 0),
        rotate: Number(form.boxRotate || 0),
        borderRadius: Number(form.boxRadius || 0),
      },
      photoBoxes: form.photoBoxes,
      multiSlot: form.multiSlot,
    }),
    [form],
  )

  const handleMockupChange = (patch) => {
    setForm((prev) => {
      const next = { ...prev, ...patch }
      if (patch.photoBox) {
        next.boxX = String(patch.photoBox.x ?? prev.boxX)
        next.boxY = String(patch.photoBox.y ?? prev.boxY)
        next.boxWidth = String(patch.photoBox.width ?? prev.boxWidth)
        next.boxHeight = String(patch.photoBox.height ?? prev.boxHeight)
        next.boxRotate = String(patch.photoBox.rotate ?? prev.boxRotate)
        next.boxRadius = String(patch.photoBox.borderRadius ?? prev.boxRadius)
      }
      if (patch.photoBoxes) next.photoBoxes = patch.photoBoxes
      if (patch.multiSlot !== undefined) next.multiSlot = patch.multiSlot
      if (patch.canvasWidth) next.canvasWidth = String(patch.canvasWidth)
      if (patch.canvasHeight) next.canvasHeight = String(patch.canvasHeight)
      if (patch.frameImage !== undefined) next.frameImage = patch.frameImage

      const slotCount = patch.slotCount
        ?? (patch.photoBoxes?.length > 1 ? patch.photoBoxes.length : null)
        ?? (patch.multiSlot && patch.photoBoxes?.length ? patch.photoBoxes.length : null)

      if (slotCount && slotCount > 1) {
        next.multiSlot = true
        next.maxPhotos = String(slotCount)
        next.allowPhotoUpload = true
      } else if (patch.multiSlot === false || (patch.photoBoxes && patch.photoBoxes.length <= 1)) {
        if (patch.slotCount === 1 || patch.multiSlot === false) {
          next.maxPhotos = '1'
        }
      }

      return next
    })
  }

  const loadTemplateOptions = () => {
    const template = getCustomizationTemplate(form.productType)
    setForm((prev) => ({
      ...prev,
      customizationGroups: template.optionGroups.map((g) => ({ ...g, values: [...g.values] })),
    }))
  }

  const updateOptionGroup = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      customizationGroups: prev.customizationGroups.map((group, i) =>
        i === index ? { ...group, [key]: value } : group,
      ),
    }))
  }

  const addOptionGroup = () =>
    setForm((prev) => ({
      ...prev,
      customizationGroups: [...prev.customizationGroups, { key: 'option', label: 'Option', values: ['Value 1'] }],
    }))

  const removeOptionGroup = (index) =>
    setForm((prev) => ({
      ...prev,
      customizationGroups: prev.customizationGroups.filter((_, i) => i !== index),
    }))

  const submit = async (overrides = {}) => {
    setError('')
    setMessage('')
    setSaving(true)
    try {
      let formToSave = { ...form, ...overrides }
      const frameUrl = formToSave.frameImage

      if (isFallbackCategoryId(formToSave.category)) {
        const productType = formToSave.productType || productTypeFromFallbackCategoryId(formToSave.category)
        const label = productTypes.find((p) => p.value === productType)?.label || productType
        try {
          const created = await api.adminCreateCategory({ name: label, productType })
          const newCat = created.category
          if (newCat?._id) {
            formToSave = { ...formToSave, category: newCat._id, productType }
            setCategories((prev) => [...prev, newCat])
          }
        } catch {
          const existing = findParentCategory(categories, productType)
          if (existing?._id) formToSave = { ...formToSave, category: existing._id }
        }
      }

      if (!formToSave.category && formToSave.productType) {
        formToSave = {
          ...formToSave,
          category: syncCategoryFromProductType(categories, formToSave.productType),
        }
      }

      if (frameUrl && (!formToSave.photoBoxes?.length)) {
        try {
          const analysis = await analyzeMockupFromUrl(frameUrl)
          formToSave = { ...formToSave, ...analysisToFormPatch(analysis, frameUrl) }
        } catch {
          if (!formToSave.frameImage) formToSave = { ...formToSave, frameImage: frameUrl }
        }
      }

      const payload = buildProductPayload(formToSave, categories)
      const canUpdate = productId && !isCatalogDemoProduct(productId)
      if (canUpdate) {
        await api.adminUpdateProduct(productId, payload)
        setMessage('Product updated successfully')
      } else {
        await api.adminCreateProduct(payload)
        setMessage(isCatalogDemoProduct(productId) ? 'Product published to database' : 'Product created successfully')
      }
      onSaved?.()
      navigate('/admin/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return {
    form,
    setForm,
    categories,
    loadCategories,
    loadProduct,
    loading,
    saving,
    error,
    message,
    setError,
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
    handleFrameUpload,
    mockupValue,
    handleMockupChange,
    loadTemplateOptions,
    updateOptionGroup,
    addOptionGroup,
    removeOptionGroup,
    submit,
  }
}
