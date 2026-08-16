import { analyzeMockupFromUrl } from './mockupAnalyzer'
import { resolveMediaUrl } from './mediaUrl'
import { usesLiveProductImage, getProductBaseImage } from '../data/fallbackCatalog'
import { COLLAGE_FRAME_MOCKUP, isBuiltInPolaroidFrame } from '../data/collageFrameMockup'
import { finalizePhotoSlots } from './mockupSlotShapes'
import { isWallWatchProduct } from './wallWatchCatalog'
import { normalizeWallWatchProduct } from './wallWatchProductDefaults'

export function getMockupFrameUrl(product) {
  return resolveMediaUrl(product?.mockup?.frameImage || product?.images?.[0] || '')
}

function hasConfiguredMockup(product) {
  const mockup = product?.mockup
  if (!mockup?.frameImage) return false
  if (mockup.photoBoxes?.length > 1) return true
  const box = mockup.photoBox
  return Boolean(box && Number(box.width) > 0 && Number(box.height) > 0)
}

function expectedPhotoCount(product) {
  return (
    Number(product?.personalization?.maxPhotos) ||
    Number(product?.defaultOptions?.collagePhotoCount) ||
    Number(product?.mockup?.photoBoxes?.length) ||
    0
  )
}

function detectedBoxesFromAnalysis(analysis) {
  if (analysis?.photoBoxes?.length > 1) return analysis.photoBoxes
  if (analysis?.photoBox) return [analysis.photoBox]
  return []
}

export function productNeedsMockupAnalysis(product) {
  if (usesLiveProductImage(product)) return false
  const frameUrl = getMockupFrameUrl(product)
  if (!frameUrl) return false
  if (!hasConfiguredMockup(product)) return true
  const expected = expectedPhotoCount(product)
  const have = product?.mockup?.photoBoxes?.length || (product?.mockup?.photoBox ? 1 : 0)
  if (expected > 1 && have < expected) return true
  return false
}

/** Detect transparent/dark photo slots from uploaded frame image and merge into product.mockup */
export async function enrichProductMockup(product) {
  if (!product) return product

  if (isWallWatchProduct(product)) {
    product = normalizeWallWatchProduct(product)
  }

  // Name plates — live product photo only; never auto-detect collage slots on catalog image
  if (usesLiveProductImage(product)) {
    const baseImageUrl = resolveMediaUrl(getProductBaseImage(product))
    return {
      ...product,
      mockup: {
        ...(product.mockup || {}),
        baseImageUrl,
      },
    }
  }

  const frameUrl = getMockupFrameUrl(product)
  if (!frameUrl) return product

  if (isBuiltInPolaroidFrame(frameUrl) && !hasConfiguredMockup(product)) {
    return {
      ...product,
      mockup: {
        ...(product.mockup || {}),
        canvas: COLLAGE_FRAME_MOCKUP.canvas,
        frameImage: resolveMediaUrl(product.mockup?.frameImage || frameUrl),
        photoBoxes: COLLAGE_FRAME_MOCKUP.photoBoxes,
        photoBox: COLLAGE_FRAME_MOCKUP.photoBoxes[0],
      },
      personalization: {
        ...(product.personalization || {}),
        allowPhotoUpload: true,
        maxPhotos: COLLAGE_FRAME_MOCKUP.photoBoxes.length,
      },
    }
  }

  const expected = expectedPhotoCount(product)
  const configuredCount =
    product.mockup?.photoBoxes?.length || (product.mockup?.photoBox?.width ? 1 : 0)
  const shouldAnalyze =
    !hasConfiguredMockup(product) || (expected > 1 && configuredCount < expected)

  if (!shouldAnalyze && hasConfiguredMockup(product)) {
    const mockup = product.mockup || {}
    const clippedBoxes =
      mockup.photoBoxes?.length > 1 ? finalizePhotoSlots(mockup.photoBoxes, product) : mockup.photoBoxes

    return {
      ...product,
      mockup: {
        ...mockup,
        frameImage: resolveMediaUrl(mockup.frameImage),
        ...(clippedBoxes?.length ? { photoBoxes: clippedBoxes } : {}),
        photoBox: clippedBoxes?.[0] || mockup.photoBox,
      },
    }
  }

  try {
    const analysis = await analyzeMockupFromUrl(frameUrl, { forAdmin: true })
    const detected = finalizePhotoSlots(detectedBoxesFromAnalysis(analysis), product)
    const multiBoxes = detected.length > 1 ? detected : []
    const slotCount = Math.max(multiBoxes.length || 1, expected || 1)

    return {
      ...product,
      mockup: {
        ...(product.mockup || {}),
        frameImage: resolveMediaUrl(product.mockup?.frameImage || frameUrl),
        canvas: {
          width: analysis.canvasWidth || product.mockup?.canvas?.width || 1000,
          height: analysis.canvasHeight || product.mockup?.canvas?.height || 1000,
        },
        photoBox: detected[0] || analysis.photoBox || product.mockup?.photoBox,
        ...(multiBoxes.length ? { photoBoxes: multiBoxes } : {}),
      },
      personalization: {
        ...(product.personalization || {}),
        allowPhotoUpload: true,
        maxPhotos: Math.max(Number(product.personalization?.maxPhotos) || 1, slotCount),
      },
    }
  } catch {
    if (hasConfiguredMockup(product)) {
      const mockup = product.mockup || {}
      const clippedBoxes =
        mockup.photoBoxes?.length > 1 ? finalizePhotoSlots(mockup.photoBoxes, product) : mockup.photoBoxes
      return {
        ...product,
        mockup: {
          ...mockup,
          frameImage: resolveMediaUrl(mockup.frameImage || frameUrl),
          ...(clippedBoxes?.length ? { photoBoxes: clippedBoxes } : {}),
        },
      }
    }

    return {
      ...product,
      mockup: {
        ...(product.mockup || {}),
        frameImage: product.mockup?.frameImage || frameUrl,
        canvas: product.mockup?.canvas || { width: 1000, height: 1000 },
        photoBox:
          product.mockup?.photoBox || { x: 120, y: 120, width: 760, height: 760, rotate: 0, borderRadius: 0 },
      },
    }
  }
}

export function analysisToFormPatch(analysis, frameUrl) {
  const boxes =
    analysis.photoBoxes?.length > 1
      ? analysis.photoBoxes
      : analysis.photoBox
        ? [analysis.photoBox]
        : []

  return {
    frameImage: frameUrl,
    canvasWidth: String(analysis.canvasWidth),
    canvasHeight: String(analysis.canvasHeight),
    photoBox: boxes[0] || analysis.photoBox,
    photoBoxes: boxes.length > 1 ? boxes : [],
    multiSlot: boxes.length > 1,
    slotCount: boxes.length || analysis.slotCount || 1,
    boxX: String(boxes[0]?.x ?? analysis.photoBox?.x ?? 0),
    boxY: String(boxes[0]?.y ?? analysis.photoBox?.y ?? 0),
    boxWidth: String(boxes[0]?.width ?? analysis.photoBox?.width ?? 0),
    boxHeight: String(boxes[0]?.height ?? analysis.photoBox?.height ?? 0),
    boxRotate: String(boxes[0]?.rotate ?? analysis.photoBox?.rotate ?? 0),
    boxRadius: String(boxes[0]?.borderRadius ?? analysis.photoBox?.borderRadius ?? 0),
    maxPhotos: String(Math.max(boxes.length || 1, analysis.slotCount || 1)),
    allowPhotoUpload: true,
  }
}
