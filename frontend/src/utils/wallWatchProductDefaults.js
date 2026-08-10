import { customizationTemplates } from '../data/customizationTemplates'
import { mockupImages } from '../data/fallbackCatalog'
import { isWallWatchProduct } from './wallWatchCatalog'
import {
  buildCollagePhotoBoxes,
  isCollagePhotoCount,
  WALL_WATCH_COLLAGE_COUNTS,
} from './wallWatchCollageLayouts'
import { isGenericSquareFrameUrl, WALL_CLOCK_SVG_FRAME_SHAPES } from './wallWatchFrameUtils'

const WALL_WATCH_TEMPLATE = customizationTemplates['custom-wall-watch']

export { WALL_WATCH_COLLAGE_COUNTS }

/** Clock dial shapes — numbers 1–12 fit cleanly on these dials only */
export const WALL_WATCH_SHAPE_OPTIONS = [
  { id: 'Circle', label: 'Circle', preview: 'circle', description: 'Round dial — best for numbers' },
  { id: 'Square Round', label: 'Square Round', preview: 'square-round', description: 'Rounded square dial' },
  { id: 'Square', label: 'Square', preview: 'square', description: 'Square frame, round number layout' },
]

export const WALL_WATCH_SHAPE_IDS = WALL_WATCH_SHAPE_OPTIONS.map((opt) => opt.id)

export function resolveWallWatchShape(shape = 'Circle') {
  if (isCollageWallWatchShape(shape)) return 'Circle'
  if (WALL_WATCH_SHAPE_IDS.includes(shape)) return shape
  return 'Circle'
}

const BASE_SHAPE_MOCKUPS = {
  Circle: {
    canvas: { width: 1000, height: 1000 },
    photoBox: { x: 145, y: 145, width: 710, height: 710, rotate: 0, borderRadius: 355 },
    frameImage: mockupImages.square,
  },
  Square: {
    canvas: { width: 1000, height: 1000 },
    photoBox: { x: 120, y: 120, width: 760, height: 760, rotate: 0, borderRadius: 16 },
    frameImage: mockupImages.square,
  },
  'Square Round': {
    canvas: { width: 1000, height: 1000 },
    photoBox: { x: 90, y: 90, width: 820, height: 820, rotate: 0, borderRadius: 410 },
    frameImage: mockupImages.square,
  },
}

/** @deprecated use BASE_SHAPE_MOCKUPS */
export const WALL_WATCH_MOCKUP_BY_SHAPE = BASE_SHAPE_MOCKUPS

export function getCollagePhotoCount(productOrOptions = {}) {
  const fromOptions = Number(productOrOptions?.collagePhotoCount)
  if (isCollagePhotoCount(fromOptions)) return fromOptions
  const fromProduct = Number(productOrOptions?.defaultOptions?.collagePhotoCount)
  if (isCollagePhotoCount(fromProduct)) return fromProduct
  if (/four photo collage/i.test(productOrOptions?.defaultOptions?.shape || productOrOptions?.shape || '')) return 4
  if (productOrOptions?.mockup?.photoBoxes?.length > 1) return productOrOptions.mockup.photoBoxes.length
  return 0
}

export function isCollageWallWatchProduct(productOrForm = {}) {
  if (productOrForm.collageEnabled === true) return true
  if (getCollagePhotoCount(productOrForm) > 1) return true
  if (productOrForm.defaultOptions?.layout === 'Collage') return true
  return /collage/i.test(productOrForm.defaultOptions?.shape || productOrForm.shape || '')
}

export function isCollageWallWatchShape(shape = '') {
  return /collage/i.test(shape)
}

export function frameTypeForShape(shape = '', collageEnabled = false) {
  if (collageEnabled) return 'Collage'
  if (isCollageWallWatchShape(shape)) return 'Collage'
  return shape
}

export function buildWallWatchCustomizationGroups() {
  return (WALL_WATCH_TEMPLATE?.optionGroups || []).map((group) => ({
    key: group.key,
    label: group.label,
    values: group.values,
  }))
}

export function buildWallWatchMockup(shape, uploadedFrameImage = '', collageOptions = {}) {
  const { collageEnabled = false, collagePhotoCount = 4 } = collageOptions
  const safeShape = resolveWallWatchShape(shape)
  const preset = BASE_SHAPE_MOCKUPS[safeShape] || BASE_SHAPE_MOCKUPS.Circle
  const canvas = { ...preset.canvas }

  if (collageEnabled && isCollagePhotoCount(collagePhotoCount)) {
    return {
      canvas,
      photoBoxes: buildCollagePhotoBoxes(collagePhotoCount, canvas),
      frameImage: uploadedFrameImage || preset.frameImage || null,
    }
  }

  return {
    canvas,
    ...(preset.photoBox ? { photoBox: { ...preset.photoBox } } : {}),
    frameImage: uploadedFrameImage || preset.frameImage || null,
  }
}

export function buildWallWatchDefaultOptions(shape, firstVariantSize = '10 inch', collageOptions = {}) {
  const { collageEnabled = false, collagePhotoCount = 4 } = collageOptions
  const safeShape = resolveWallWatchShape(shape)
  const collage = collageEnabled && isCollagePhotoCount(collagePhotoCount)
  return {
    shape: safeShape,
    clockHands: 'Classic Silver',
    size: firstVariantSize,
    dialStyle: 'Modern Numbers',
    numberStyle: 'Modern',
    numberColor: 'White',
    layout: collage ? 'Collage' : 'Single',
    frameStyle: collage ? 'Collage' : safeShape,
    collageEnabled: Boolean(collage),
    collagePhotoCount: collage ? collagePhotoCount : 1,
  }
}

export function buildWallWatchPersonalization(shape, collageOptions = {}) {
  const { collageEnabled = false, collagePhotoCount = 4 } = collageOptions
  const collage = collageEnabled && isCollagePhotoCount(collagePhotoCount)
  return {
    allowPhotoUpload: true,
    maxPhotos: collage ? collagePhotoCount : 1,
    allowText: false,
  }
}

/** Ensure API/admin products get the same designer features as demo wall clocks */
export function normalizeWallWatchProduct(product) {
  if (!product || !isWallWatchProduct(product)) return product

  const rawShape = product.defaultOptions?.shape || 'Circle'
  const shape = resolveWallWatchShape(rawShape)
  const collageEnabled = isCollageWallWatchProduct(product)
  const collagePhotoCount = getCollagePhotoCount(product) || (collageEnabled ? 4 : 1)
  const collageOptions = { collageEnabled, collagePhotoCount: collageEnabled ? collagePhotoCount : 1 }

  const built = buildWallWatchMockup(shape, product.mockup?.frameImage, collageOptions)
  const existingMockup = product.mockup || {}

  const mockup = {
    ...built,
    ...existingMockup,
    canvas: existingMockup.canvas || built.canvas,
    frameImage: existingMockup.frameImage || built.frameImage || null,
  }

  if (collageEnabled) {
    mockup.photoBoxes = built.photoBoxes
    delete mockup.photoBox
  } else if (!existingMockup.photoBox && built.photoBox) {
    mockup.photoBox = built.photoBox
    delete mockup.photoBoxes
  }

  if (!WALL_CLOCK_SVG_FRAME_SHAPES.has(shape) && isGenericSquareFrameUrl(mockup.frameImage)) {
    mockup.frameImage = null
  }

  return {
    ...product,
    productType: product.productType || 'custom-wall-watch',
    personalization: {
      ...buildWallWatchPersonalization(shape, collageOptions),
      ...(product.personalization || {}),
      allowPhotoUpload: product.personalization?.allowPhotoUpload !== false,
      maxPhotos: collageEnabled ? collagePhotoCount : product.personalization?.maxPhotos || 1,
    },
    defaultOptions: {
      ...buildWallWatchDefaultOptions(shape, product.variants?.[0]?.size, collageOptions),
      ...(product.defaultOptions || {}),
      shape,
      collageEnabled: Boolean(collageEnabled),
      collagePhotoCount: collageEnabled ? collagePhotoCount : 1,
    },
    customizationGroups: product.customizationGroups?.length
      ? product.customizationGroups
      : buildWallWatchCustomizationGroups(),
    customizationTabs: product.customizationTabs || WALL_WATCH_TEMPLATE?.tabs || ['All', 'Collage'],
    mockup,
  }
}

/** Payload fields shared by admin create/update */
export function buildWallWatchAdminPayload(form, variants) {
  const shape = resolveWallWatchShape(form.shape || 'Circle')
  const collageEnabled = Boolean(form.collageEnabled)
  const collagePhotoCount = isCollagePhotoCount(form.collagePhotoCount) ? form.collagePhotoCount : 4
  const collageOptions = { collageEnabled, collagePhotoCount }

  const framedVariants = variants.map((variant, index) => ({
    ...variant,
    frameType: variant.frameType?.trim() || frameTypeForShape(shape, collageEnabled),
    sku:
      variant.sku?.trim() ||
      `CWW-${shape.replace(/\s+/g, '-').slice(0, 10).toUpperCase()}-${collageEnabled ? `${collagePhotoCount}P` : '1P'}-${index + 1}`,
  }))

  return {
    title: form.title.trim(),
    productType: form.productType || 'custom-wall-watch',
    category: form.categoryId,
    description: form.description.trim(),
    highlights: form.highlights
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean),
    images: form.images,
    thumbnail: form.thumbnail || form.images[0] || '',
    personalization: buildWallWatchPersonalization(shape, collageOptions),
    mockup: buildWallWatchMockup(shape, form.frameImage, collageOptions),
    defaultOptions: buildWallWatchDefaultOptions(shape, framedVariants[0]?.size, collageOptions),
    customizationGroups: buildWallWatchCustomizationGroups(),
    customizationTabs: WALL_WATCH_TEMPLATE?.tabs || ['All', 'Collage'],
    variants: framedVariants,
    isFeatured: form.isFeatured,
    isActive: form.isActive,
  }
}
