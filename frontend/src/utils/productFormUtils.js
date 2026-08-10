import { getCustomizationTemplate } from '../data/customizationTemplates'
import { finalizePhotoSlots } from './mockupSlotShapes'
import { buildSeoPayload } from './productSeoAdmin'

export const emptyVariant = () => ({
  sku: '',
  size: '',
  material: 'Acrylic',
  frameType: 'None',
  price: '',
  compareAtPrice: '',
  stock: '50',
  isActive: true,
})

export const emptyForm = {
  title: '',
  slug: '',
  productType: 'acrylic-wall-photo',
  category: '',
  subCategory: '',
  description: '',
  highlights: '',
  images: [],
  thumbnail: '',
  variants: [emptyVariant()],
  allowPhotoUpload: true,
  allowText: false,
  maxPhotos: '1',
  textFields: '',
  personalizationInstructions: '',
  canvasWidth: '1000',
  canvasHeight: '1000',
  frameImage: '',
  boxX: '90',
  boxY: '90',
  boxWidth: '820',
  boxHeight: '820',
  boxRotate: '0',
  boxRadius: '18',
  multiSlot: false,
  photoBoxes: [],
  customizationGroups: [],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  brand: '',
  tags: '',
  barcode: '',
  isFeatured: false,
  isActive: true,
}

export function productToForm(product) {
  const mockup = product.mockup || {}
  const canvas = mockup.canvas || { width: 1000, height: 1000 }
  const box = mockup.photoBox || {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    rotate: 0,
    borderRadius: 0,
  }

  return {
    title: product.title || '',
    slug: product.slug || '',
    productType: product.productType,
    category: product.category?._id || product.category || '',
    subCategory: product.subCategory?._id || product.subCategory || '',
    description: product.description || '',
    highlights: (product.highlights || []).join(', '),
    images: product.images || [],
    thumbnail: product.thumbnail || '',
    variants: product.variants?.length
      ? product.variants.map((v) => ({
          sku: v.sku || '',
          size: v.size || '',
          material: v.material || 'Acrylic',
          frameType: v.frameType || 'None',
          price: v.price ?? '',
          compareAtPrice: v.compareAtPrice ?? '',
          stock: v.stock ?? '0',
          isActive: v.isActive !== false,
          _id: v._id,
        }))
      : [emptyVariant()],
    allowPhotoUpload: product.personalization?.allowPhotoUpload !== false,
    allowText: Boolean(product.personalization?.allowText),
    maxPhotos: mockup.photoBoxes?.length > 1
      ? String(mockup.photoBoxes.length)
      : String(product.personalization?.maxPhotos ?? 1),
    textFields: (product.personalization?.textFields || []).join(', '),
    personalizationInstructions: product.personalization?.instructions || '',
    canvasWidth: String(canvas.width || 1000),
    canvasHeight: String(canvas.height || 1000),
    frameImage: mockup.frameImage || '',
    boxX: String(box.x ?? 0),
    boxY: String(box.y ?? 0),
    boxWidth: String(box.width ?? canvas.width),
    boxHeight: String(box.height ?? canvas.height),
    boxRotate: String(box.rotate ?? 0),
    boxRadius: String(box.borderRadius ?? 0),
    multiSlot: Boolean(mockup.photoBoxes?.length),
    photoBoxes: finalizePhotoSlots(mockup.photoBoxes || [], product),
    customizationGroups: product.customizationGroups?.length
      ? product.customizationGroups
      : getCustomizationTemplate(product.productType).optionGroups,
    seoTitle: product.seo?.title || '',
    seoDescription: product.seo?.description || '',
    seoKeywords: (product.seo?.keywords || []).join(', '),
    brand: product.attributes?.brand?.[0] || '',
    tags: product.attributes?.theme?.join(', ') || '',
    barcode: '',
    isFeatured: Boolean(product.isFeatured),
    isActive: product.isActive !== false,
  }
}

export function buildProductPayload(form, categories) {
  const variants = form.variants
    .filter((v) => v.size && v.price !== '')
    .map((v) => ({
      ...(v._id ? { _id: v._id } : {}),
      sku: v.sku || `${form.productType}-${v.size}-${Date.now()}`.replace(/\s+/g, '-').slice(0, 40),
      size: v.size,
      material: v.material || 'Acrylic',
      frameType: v.frameType || 'None',
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      stock: Number(v.stock || 0),
      isActive: v.isActive !== false,
    }))

  if (!variants.length) {
    throw new Error('Add at least one variant with size and price')
  }

  const category = categories.find((c) => c._id === form.category)

  const slotCount = form.multiSlot && form.photoBoxes?.length ? form.photoBoxes.length : 1

  const payload = {
    title: form.title,
    productType: form.productType,
    category: form.category,
    subCategory: category?.parent ? form.category : form.subCategory || undefined,
    description: form.description,
    highlights: form.highlights
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean),
    images: form.images,
    thumbnail: form.thumbnail || undefined,
    isFeatured: form.isFeatured,
    isActive: form.isActive,
    variants,
    personalization: {
      allowPhotoUpload: form.allowPhotoUpload,
      maxPhotos: Number(form.maxPhotos || slotCount || 1),
      allowText: form.allowText,
      textFields: form.textFields
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      instructions: form.personalizationInstructions || undefined,
    },
    mockup: {
      frameImage: form.frameImage || undefined,
      canvas: { width: Number(form.canvasWidth || 1000), height: Number(form.canvasHeight || 1000) },
      photoBox: {
        x: Number(form.boxX || 0),
        y: Number(form.boxY || 0),
        width: Number(form.boxWidth || 0),
        height: Number(form.boxHeight || 0),
        rotate: Number(form.boxRotate || 0),
        borderRadius: Number(form.boxRadius || 0),
      },
        ...(form.photoBoxes?.length > 1
        ? {
            photoBoxes: finalizePhotoSlots(form.photoBoxes, {
              title: form.title,
              slug: form.slug,
              mockup: { slotShape: form.mockupSlotShape },
            }).map((box) => ({
              x: Number(box.x ?? 0),
              y: Number(box.y ?? 0),
              width: Number(box.width ?? 0),
              height: Number(box.height ?? 0),
              rotate: Number(box.rotate ?? 0),
              borderRadius: Number(box.borderRadius ?? 0),
              ...(box.clipPath ? { clipPath: box.clipPath } : {}),
              ...(box.fillRatio != null ? { fillRatio: Number(box.fillRatio) } : {}),
            })),
          }
        : {}),
    },
    customizationGroups: form.customizationGroups.filter((g) => g.key && g.label && g.values?.length),
    defaultOptions: Object.fromEntries(
      form.customizationGroups.filter((g) => g.key && g.values?.length).map((g) => [g.key, g.values[0]]),
    ),
    ...buildSeoPayload(form),
  }

  if (form.brand || form.tags) {
    payload.attributes = {
      ...(form.brand ? { brand: [form.brand] } : {}),
      ...(form.tags
        ? {
            theme: form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          }
        : {}),
    }
  }

  return payload
}

export function getProductStatus(product) {
  const stock = (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)
  if (!product.isActive) return { label: 'Hidden', tone: 'neutral' }
  if (stock <= 0) return { label: 'Out of Stock', tone: 'danger' }
  return { label: 'Published', tone: 'success' }
}

export function getPrimarySku(product) {
  return product.variants?.[0]?.sku || '—'
}

export function getTotalStock(product) {
  return (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)
}

export function getMinPrice(product) {
  const prices = (product.variants || []).map((v) => v.price).filter(Number.isFinite)
  return prices.length ? Math.min(...prices) : 0
}

export function getSalePrice(product) {
  const prices = (product.variants || []).map((v) => v.compareAtPrice).filter(Number.isFinite)
  return prices.length ? Math.min(...prices) : null
}
