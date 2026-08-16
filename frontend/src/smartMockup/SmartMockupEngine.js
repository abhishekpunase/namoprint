import { analyzeMockupFile, analyzeMockupFromUrl } from '../utils/mockupAnalyzer'
import { punchFrameHoles } from '../utils/frameImageUtils'
import { resolveMediaUrl } from '../utils/mediaUrl'
import { DEFAULT_LAYER_VISIBILITY, DEFAULT_SLOT_TRANSFORM, MAX_SMART_SLOTS, SMART_MOCKUP_VERSION } from './constants'

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = resolveMediaUrl(url)
  })
}

function insetBox(box, ratio = 0.05) {
  const padX = Math.round(box.width * ratio)
  const padY = Math.round(box.height * ratio)
  return {
    ...box,
    x: box.x + padX,
    y: box.y + padY,
    width: Math.max(8, box.width - padX * 2),
    height: Math.max(8, box.height - padY * 2),
  }
}

function boxesToSlots(boxes, canvas) {
  return boxes.slice(0, MAX_SMART_SLOTS).map((box, layerIndex) => ({
    id: `slot-${layerIndex + 1}`,
    layerIndex,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    rotate: box.rotate || 0,
    borderRadius: box.borderRadius || 0,
    scale: 1,
    transform: { ...DEFAULT_SLOT_TRANSFORM() },
    photoUrl: '',
    assetId: '',
  }))
}

/** Generate mask PNG (white = photo visible) from slot regions */
export async function generateMaskDataUrl(frameUrl, slots, canvas) {
  const w = canvas.width
  const h = canvas.height
  const el = document.createElement('canvas')
  el.width = w
  el.height = h
  const ctx = el.getContext('2d')
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, w, h)

  try {
    const img = await loadImage(frameUrl)
    ctx.drawImage(img, 0, 0, w, h)
    const { data } = ctx.getImageData(0, 0, w, h)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      const isHole = a < 140 || (r < 75 && g < 75 && b < 75)
      data[i] = isHole ? 255 : 0
      data[i + 1] = isHole ? 255 : 0
      data[i + 2] = isHole ? 255 : 0
      data[i + 3] = isHole ? 255 : 0
    }
    ctx.putImageData(new ImageData(data, w, h), 0, 0)
  } catch {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ffffff'
    for (const slot of slots) {
      ctx.fillRect(slot.x, slot.y, slot.width, slot.height)
    }
  }

  return el.toDataURL('image/png')
}

/** Generate overlay (frame with transparent photo holes) */
export async function generateOverlayDataUrl(frameUrl, slots, canvas) {
  try {
    const boxes = slots.map(({ x, y, width, height, rotate, borderRadius }) => ({
      x, y, width, height, rotate, borderRadius,
    }))
    return await punchFrameHoles(frameUrl, boxes, canvas)
  } catch {
    return resolveMediaUrl(frameUrl)
  }
}

/** Generate thumbnail preview from frame */
export async function generatePreviewDataUrl(frameUrl, canvas, maxDim = 800) {
  const img = await loadImage(frameUrl)
  const w = canvas.width
  const h = canvas.height
  const scale = Math.min(1, maxDim / Math.max(w, h))
  const el = document.createElement('canvas')
  el.width = Math.round(w * scale)
  el.height = Math.round(h * scale)
  const ctx = el.getContext('2d')
  ctx.drawImage(img, 0, 0, el.width, el.height)
  return el.toDataURL('image/webp', 0.82)
}

/**
 * Full smart mockup generation pipeline — runs automatically on admin frame upload.
 * Uses existing mockup fields + defaultOptions.smartMockup (Mixed, no schema change).
 */
export async function generateSmartMockupFromAnalysis(analysis, frameUrl) {
  const canvas = { width: analysis.canvasWidth, height: analysis.canvasHeight }
  const boxes =
    analysis.photoBoxes?.length > 1
      ? analysis.photoBoxes
      : analysis.photoBox
        ? [analysis.photoBox]
        : []

  const slots = boxesToSlots(boxes, canvas)
  const printArea = boxes.length ? { boxes } : { boxes: [analysis.photoBox] }
  const safeArea = { boxes: boxes.map((b) => insetBox(b, 0.06)) }

  const [maskUrl, overlayUrl, previewUrl] = await Promise.all([
    generateMaskDataUrl(frameUrl, slots, canvas),
    generateOverlayDataUrl(frameUrl, slots, canvas),
    generatePreviewDataUrl(frameUrl, canvas).catch(() => ''),
  ])

  return {
    version: SMART_MOCKUP_VERSION,
    canvas,
    frameUrl: resolveMediaUrl(frameUrl),
    maskUrl,
    overlayUrl,
    previewUrl,
    slots,
    photoBoxes: boxes,
    photoBox: analysis.photoBox,
    multiSlot: analysis.multiSlot,
    slotCount: analysis.slotCount || slots.length || 1,
    printArea,
    safeArea,
    layerVisibility: { ...DEFAULT_LAYER_VISIBILITY },
    generatedAt: Date.now(),
  }
}

export async function generateSmartMockupFromFile(file) {
  const analysis = await analyzeMockupFile(file, { forAdmin: true })
  const frameUrl = URL.createObjectURL(file)
  try {
    return await generateSmartMockupFromAnalysis(analysis, frameUrl)
  } finally {
    setTimeout(() => URL.revokeObjectURL(frameUrl), 5000)
  }
}

export async function generateSmartMockupFromUrl(url) {
  const analysis = await analyzeMockupFromUrl(url, { forAdmin: true })
  return generateSmartMockupFromAnalysis(analysis, url)
}

export function smartMockupToFormPatch(smartMockup, uploadedFrameUrl) {
  const frameUrl = uploadedFrameUrl || smartMockup.frameUrl
  return {
    frameImage: frameUrl,
    canvasWidth: String(smartMockup.canvas.width),
    canvasHeight: String(smartMockup.canvas.height),
    photoBox: smartMockup.photoBox,
    photoBoxes: smartMockup.photoBoxes?.length > 1 ? smartMockup.photoBoxes : [],
    multiSlot: smartMockup.multiSlot,
    slotCount: smartMockup.slotCount,
    boxX: String(smartMockup.photoBox?.x ?? 0),
    boxY: String(smartMockup.photoBox?.y ?? 0),
    boxWidth: String(smartMockup.photoBox?.width ?? 0),
    boxHeight: String(smartMockup.photoBox?.height ?? 0),
    maxPhotos: String(smartMockup.slotCount || 1),
    allowPhotoUpload: true,
    smartMockup,
    overlayImageUrl: smartMockup.maskUrl,
    baseImageUrl: smartMockup.previewUrl,
  }
}

export function hasSmartMockup(product) {
  if (!product) return false
  return Boolean(
    product.mockup?.frameImage ||
      product.defaultOptions?.smartMockup?.frameUrl ||
      product.defaultOptions?.smartMockup?.slots?.length ||
      product.mockup?.photoBoxes?.length ||
      (product.personalization?.allowPhotoUpload !== false && product.images?.[0]),
  )
}
