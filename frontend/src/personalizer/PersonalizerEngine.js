import {
  generateSmartMockupFromFile,
  generateSmartMockupFromUrl,
  generateSmartMockupFromAnalysis,
  smartMockupToFormPatch,
} from '../smartMockup/SmartMockupEngine'
import { analyzeMockupFile } from '../utils/mockupAnalyzer'
import { PERSONALIZER_VERSION } from './constants'

export {
  generateSmartMockupFromFile,
  generateSmartMockupFromUrl,
  generateSmartMockupFromAnalysis,
}

/** Build personalizer config from smart mockup pipeline output */
export function buildPersonalizerConfig(smartMockup) {
  return {
    version: PERSONALIZER_VERSION,
    enabled: true,
    canvas: smartMockup.canvas,
    frameUrl: smartMockup.frameUrl,
    maskUrl: smartMockup.maskUrl,
    overlayUrl: smartMockup.overlayUrl,
    previewUrl: smartMockup.previewUrl,
    slots: smartMockup.slots,
    printArea: smartMockup.printArea,
    safeArea: smartMockup.safeArea,
    bleedArea: smartMockup.safeArea,
    layerState: smartMockup.layerVisibility,
    background: { type: 'gradient', color: '#f3f4f6', color2: '#e5e7eb', imageUrl: '' },
    textLayers: [],
    clipartLayers: [],
    generatedAt: Date.now(),
  }
}

export async function generatePersonalizerFromFile(file) {
  const smart = await generateSmartMockupFromFile(file)
  return buildPersonalizerConfig(smart)
}

export async function generatePersonalizerFromUrl(url) {
  const smart = await generateSmartMockupFromUrl(url)
  return buildPersonalizerConfig(smart)
}

export async function analyzeAndGenerateFromFile(file) {
  const analysis = await analyzeMockupFile(file)
  return { analysis, personalizer: null }
}

export function personalizerToFormPatch(personalizer, frameUrl) {
  const smartPatch = smartMockupToFormPatch(
    {
      ...personalizer,
      photoBox: personalizer.slots?.[0]
        ? {
            x: personalizer.slots[0].x,
            y: personalizer.slots[0].y,
            width: personalizer.slots[0].width,
            height: personalizer.slots[0].height,
            rotate: personalizer.slots[0].rotate || 0,
            borderRadius: personalizer.slots[0].borderRadius || 0,
          }
        : {},
      photoBoxes:
        personalizer.slots?.length > 1
          ? personalizer.slots.map(({ x, y, width, height, rotate, borderRadius }) => ({
              x,
              y,
              width,
              height,
              rotate: rotate || 0,
              borderRadius: borderRadius || 0,
            }))
          : [],
      multiSlot: personalizer.slots?.length > 1,
      slotCount: personalizer.slots?.length || 1,
    },
    frameUrl,
  )

  return {
    ...smartPatch,
    personalizer,
  }
}

export function hasPersonalizer(product) {
  if (!product) return false
  if (product.defaultOptions?.personalizer?.legacy === true) return false
  if (product.defaultOptions?.personalizer?.enabled === false) return false
  return Boolean(
    product.mockup?.frameImage ||
      product.defaultOptions?.personalizer?.frameUrl ||
      product.defaultOptions?.personalizer?.slots?.length,
  )
}

export function extractPersonalizerFromProduct(product) {
  const embedded = product?.defaultOptions?.personalizer
  const mockup = product?.mockup || {}

  if (embedded?.version) {
    return {
      ...embedded,
      frameUrl: embedded.frameUrl || mockup.frameImage || '',
      maskUrl: embedded.maskUrl || mockup.overlayImageUrl || '',
      previewUrl: embedded.previewUrl || mockup.baseImageUrl || '',
    }
  }

  const photoBoxes = mockup.photoBoxes?.length ? mockup.photoBoxes : mockup.photoBox ? [mockup.photoBox] : []

  return {
    version: PERSONALIZER_VERSION,
    enabled: Boolean(mockup.frameImage),
    canvas: mockup.canvas || { width: 1000, height: 1000 },
    frameUrl: mockup.frameImage || product?.images?.[0] || '',
    maskUrl: mockup.overlayImageUrl || '',
    overlayUrl: '',
    previewUrl: mockup.baseImageUrl || '',
    slots: photoBoxes.map((box, i) => ({
      id: `slot-${i + 1}`,
      layerIndex: i,
      ...box,
      transform: { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false },
      photoUrl: '',
      assetId: '',
    })),
    textLayers: [],
    clipartLayers: [],
    background: { type: 'gradient', color: '#f3f4f6', color2: '#e5e7eb', imageUrl: '' },
    layerState: {},
  }
}
