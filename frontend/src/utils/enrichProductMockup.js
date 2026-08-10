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

export function productNeedsMockupAnalysis(product) {
  if (usesLiveProductImage(product)) return false
  const frameUrl = getMockupFrameUrl(product)
  if (!frameUrl) return false
  if (hasConfiguredMockup(product)) return false
  return true
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

  if (hasConfiguredMockup(product)) {
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

  if (isBuiltInPolaroidFrame(frameUrl)) {
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

  try {
    const analysis = await analyzeMockupFromUrl(frameUrl)
    const multiBoxes = analysis.photoBoxes?.length > 1 ? analysis.photoBoxes : []
    const slotCount = multiBoxes.length || 1

    return {
      ...product,
      mockup: {
        ...(product.mockup || {}),
        frameImage: product.mockup?.frameImage || frameUrl,
        canvas: {
          width: analysis.canvasWidth,
          height: analysis.canvasHeight,
        },
        photoBox: analysis.photoBox,
        ...(multiBoxes.length ? { photoBoxes: multiBoxes } : {}),
      },
      personalization: {
        ...(product.personalization || {}),
        allowPhotoUpload: true,
        maxPhotos: slotCount,
      },
    }
  } catch {
    return {
      ...product,
      mockup: {
        ...(product.mockup || {}),
        frameImage: product.mockup?.frameImage || frameUrl,
        canvas: product.mockup?.canvas || { width: 1000, height: 1000 },
        photoBox: product.mockup?.photoBox || { x: 120, y: 120, width: 760, height: 760, rotate: 0, borderRadius: 0 },
      },
    }
  }
}

export function analysisToFormPatch(analysis, frameUrl) {
  return {
    frameImage: frameUrl,
    canvasWidth: String(analysis.canvasWidth),
    canvasHeight: String(analysis.canvasHeight),
    photoBox: analysis.photoBox,
    photoBoxes: analysis.photoBoxes || [],
    multiSlot: analysis.multiSlot,
    slotCount: analysis.slotCount,
    boxX: String(analysis.photoBox?.x ?? 0),
    boxY: String(analysis.photoBox?.y ?? 0),
    boxWidth: String(analysis.photoBox?.width ?? 0),
    boxHeight: String(analysis.photoBox?.height ?? 0),
    boxRotate: String(analysis.photoBox?.rotate ?? 0),
    boxRadius: String(analysis.photoBox?.borderRadius ?? 0),
    maxPhotos: String(analysis.slotCount || 1),
    allowPhotoUpload: true,
  }
}
