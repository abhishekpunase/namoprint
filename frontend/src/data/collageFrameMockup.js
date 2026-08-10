/** Polaroid collage frame — matches /mockups/frame-collage.svg (1024×1536) */
import { getProductCustomizationTemplate } from './customizationTemplates.js'
import { finalizePhotoSlots } from '../utils/mockupSlotShapes.js'

export const COLLAGE_FRAME_MOCKUP = {
  canvas: { width: 1024, height: 1536 },
  frameImage: '/mockups/frame-collage.svg',
  photoBoxes: [
    { id: 1, x: 75, y: 95, width: 515, height: 550 },
    { id: 2, x: 300, y: 500, width: 530, height: 440 },
    { id: 3, x: 515, y: 940, width: 440, height: 390 },
  ],
}

export function isBuiltInPolaroidFrame(frameImage) {
  const frame = String(frameImage || '').toLowerCase()
  return frame.includes('frame-collage') || frame.includes('/mockups/frame-collage')
}

/** Admin canvas is the coordinate system for photo boxes — do not inflate or reshape it. */
export function resolveCollageCanvas(_frameImage, canvas) {
  if (canvas?.width && canvas?.height) {
    return { width: Number(canvas.width), height: Number(canvas.height) }
  }
  if (isBuiltInPolaroidFrame(_frameImage)) {
    return COLLAGE_FRAME_MOCKUP.canvas
  }
  return COLLAGE_FRAME_MOCKUP.canvas
}

export function isCollageFrameProduct(product, variant, options = {}) {
  const frameType = String(variant?.frameType || options?.frameStyle || '').toLowerCase()
  return (
    product?.productType === 'photo-collage' ||
    frameType.includes('collage') ||
    options?.layout === 'Collage' ||
    String(options?.shape || '').includes('Four Photo') ||
    countSignificantMockupSlots(product?.mockup) > 1
  )
}

function isValidPhotoBox(box) {
  return box && Number(box.width) > 0 && Number(box.height) > 0
}

/** Drop tiny auto-detected regions (LED dots, noise) — keep real photo windows only */
export function filterSignificantPhotoBoxes(boxes = [], product = null) {
  const valid = boxes.filter(isValidPhotoBox)
  if (valid.length <= 1) return finalizePhotoSlots(valid, product)

  const ranked = valid
    .map((box) => ({ box, area: Number(box.width) * Number(box.height) }))
    .sort((a, b) => b.area - a.area)

  const maxArea = ranked[0].area
  const MIN_AREA_RATIO = 0.08
  const MIN_SIDE = 80

  const significant = ranked.filter(
    ({ box, area }) =>
      area >= maxArea * MIN_AREA_RATIO &&
      Number(box.width) >= MIN_SIDE &&
      Number(box.height) >= MIN_SIDE,
  )

  const picked = significant.length ? significant.map((entry) => entry.box) : [ranked[0].box]
  return finalizePhotoSlots(picked, product)
}

function countSignificantMockupSlots(mockup) {
  if (!mockup) return 0
  return filterSignificantPhotoBoxes(mockup.photoBoxes || []).length
}

function resolvePhotoBoxes(mockup, product = null) {
  if (!mockup) return []
  const single = isValidPhotoBox(mockup.photoBox) ? mockup.photoBox : null
  const fromArray = filterSignificantPhotoBoxes(mockup.photoBoxes || [], product)

  if (fromArray.length > 1) return fromArray
  if (fromArray.length === 1) return fromArray
  if (single) return [single]
  return []
}

/** Resolve frame + slot layout — always prefer admin-uploaded mockup data */
export function resolveCollageMockup(product, variant, options = {}) {
  const mockup = product?.mockup
  const frameImage = mockup?.frameImage || product?.images?.[0]
  const adminBoxes = resolvePhotoBoxes(mockup, product)

  if (frameImage && adminBoxes.length) {
    return {
      frameImage,
      photoBoxes: adminBoxes,
      canvas: resolveCollageCanvas(frameImage, mockup?.canvas),
    }
  }

  if (frameImage && isBuiltInPolaroidFrame(frameImage)) {
    return {
      canvas: COLLAGE_FRAME_MOCKUP.canvas,
      photoBoxes: COLLAGE_FRAME_MOCKUP.photoBoxes,
      frameImage,
    }
  }

  if (isCollageFrameProduct(product, variant, options)) {
    return COLLAGE_FRAME_MOCKUP
  }

  return null
}

/**
 * Same photo-slot list used by PreviewFrame — drives upload requirements too.
 */
export function resolvePreviewPhotoBoxes(product, variant, options = {}) {
  const collageMockup = resolveCollageMockup(product, variant, options)
  if (collageMockup?.photoBoxes?.length) {
    return filterSignificantPhotoBoxes(collageMockup.photoBoxes, product)
  }

  const mockup = product?.mockup
  const significant = filterSignificantPhotoBoxes(mockup?.photoBoxes || [], product)
  if (significant.length > 1) return significant
  if (significant.length === 1) return significant
  if (isValidPhotoBox(mockup?.photoBox)) {
    return [mockup.photoBox]
  }
  return []
}

/** How many photos the customer must upload — always matches the frame preview */
export function getRequiredPhotoSlotCount(product, variant, options = {}) {
  const boxes = resolvePreviewPhotoBoxes(product, variant, options)
  if (boxes.length > 0) {
    return boxes.length
  }

  if (options.set === '9 Photo Set') return 9
  if (options.set === '6 Photo Set' || product?.productType === 'photo-album') {
    const template = getProductCustomizationTemplate(product)
    return Math.min(template.photoSlots || 6, 6)
  }

  const collageActive =
    options.collageEnabled ||
    options.shape === 'Four Photo Collage' ||
    options.layout === 'Collage' ||
    product?.productType === 'photo-collage' ||
    isCollageFrameProduct(product, variant, options)

  if (collageActive) {
    const count = Number(options.collagePhotoCount) || Number(product?.defaultOptions?.collagePhotoCount)
    return count > 1 ? count : 4
  }

  return 1
}
