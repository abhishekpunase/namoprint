import { resolveCollageMockup } from '../data/collageFrameMockup'
import { getProductFrameImage, usesLiveProductImage } from '../data/fallbackCatalog'
import { getMockupFrameUrl } from './enrichProductMockup'
import { prepareFrameOverlayForExport, shouldPunchFrameHoles, inferSlotClipPathsFromFrame } from './frameImageUtils'
import { getObjectContainFit, resolveMockupLayout } from './mockupLayout'
import { resolveMediaUrl } from './mediaUrl'
import { drawClockFace, drawCssClockFrame, shouldShowClockDial } from './clockCanvasExport'
import { HEX_PHOTO_FILL_SCALE, isHexClipPath } from './mockupSlotShapes'

const imageCache = new Map()

function loadImage(url) {
  if (!url) return Promise.reject(new Error('Missing image URL'))
  const key = String(url).startsWith('blob:') || String(url).startsWith('data:')
    ? url
    : resolveMediaUrl(url) || url

  if (imageCache.has(key)) return imageCache.get(key)

  const promise = new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      imageCache.delete(key)
      reject(new Error(`Could not load image: ${key}`))
    }
    img.src = key
  })
  imageCache.set(key, promise)
  return promise
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function applyBoxClip(ctx, box) {
  if (box.clipPath?.startsWith('polygon(')) {
    const inner = box.clipPath.slice(8, -1)
    const points = inner.split(',').map((pair) => {
      const [xp, yp] = pair.trim().split(/\s+/)
      return [
        box.x + (parseFloat(xp) / 100) * box.width,
        box.y + (parseFloat(yp) / 100) * box.height,
      ]
    })
    ctx.beginPath()
    points.forEach(([px, py], index) => {
      if (index === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.closePath()
    ctx.clip()
    return
  }

  const radius = Number(box.borderRadius) || 0
  if (radius > 0) {
    roundRectPath(ctx, box.x, box.y, box.width, box.height, radius)
    ctx.clip()
    return
  }

  ctx.beginPath()
  ctx.rect(box.x, box.y, box.width, box.height)
  ctx.clip()
}

/** Match PreviewFrame PhotoSlot — object-cover + pan/zoom crop */
function drawPhotoInBox(ctx, img, box, crop = {}) {
  const effCrop = { x: 0, y: 0, scale: 1, rotate: 0, ...crop }
  const hexSlot = isHexClipPath(box.clipPath)
  const imgScale = (effCrop.scale || 1) * (hexSlot ? HEX_PHOTO_FILL_SCALE : 1)

  ctx.save()

  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  if (box.rotate) {
    ctx.translate(cx, cy)
    ctx.rotate((box.rotate * Math.PI) / 180)
    ctx.translate(-cx, -cy)
  }

  applyBoxClip(ctx, box)

  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const coverScale = Math.max(box.width / iw, box.height / ih) * imgScale
  const dw = iw * coverScale
  const dh = ih * coverScale

  const posX = 0.5 - (effCrop.x || 0) * 0.2
  const posY = 0.5 - (effCrop.y || 0) * 0.2
  const centerX = box.x + posX * box.width
  const centerY = box.y + posY * box.height

  ctx.translate(centerX, centerY)
  ctx.rotate(((effCrop.rotate || 0) * Math.PI) / 180)
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
  ctx.restore()
}

function resolvePhotoSources({ slotPhotos = [], design = {}, photoUrl }) {
  if (slotPhotos.length) {
    return slotPhotos.map((entry) => ({
      url: entry?.url,
      crop: entry?.crop,
    }))
  }
  const url = photoUrl || design.photoUrl
  if (url) return [{ url, crop: design.crop }]
  return []
}

function resolvePhotoBoxes(product, collageMockup) {
  if (collageMockup?.photoBoxes?.length) return collageMockup.photoBoxes
  if (product?.mockup?.photoBoxes?.length > 1) return product.mockup.photoBoxes
  if (product?.mockup?.photoBox?.width) return [product.mockup.photoBox]
  return [{ x: 120, y: 120, width: 760, height: 760, borderRadius: 20 }]
}

/** Same frame source chain as PreviewFrame / enrichProductMockup */
function resolveFrameOverlayUrl(product, variant, options) {
  if (usesLiveProductImage(product)) return ''

  const collageMockup = resolveCollageMockup(product, variant, options)
  const raw =
    collageMockup?.frameImage ||
    product?.mockup?.frameImage ||
    getMockupFrameUrl(product) ||
    getProductFrameImage(product, variant, options) ||
    product?.images?.[0] ||
    ''

  return resolveMediaUrl(raw)
}

async function resolveExportLayout(product, variant, options) {
  const collageMockup = resolveCollageMockup(product, variant, options)
  const frameUrl = resolveFrameOverlayUrl(product, variant, options)
  const photoBoxesList = resolvePhotoBoxes(product, collageMockup)
  const canvas = collageMockup?.canvas || product?.mockup?.canvas || { width: 1000, height: 1000 }

  let layoutBoxes = photoBoxesList
  if (frameUrl) {
    const layout = await resolveMockupLayout(frameUrl, canvas, photoBoxesList)
    layoutBoxes = layout.photoBoxes?.length ? layout.photoBoxes : photoBoxesList
    layoutBoxes = await inferSlotClipPathsFromFrame(frameUrl, layoutBoxes, canvas)
  }

  return { frameUrl, canvas, layoutBoxes, useCollageSlots: layoutBoxes.length > 1 }
}

async function drawFrameOverlay(ctx, frameUrl, canvas, layoutBoxes) {
  if (!frameUrl) return false

  let frameSrc = frameUrl
  if (shouldPunchFrameHoles(frameUrl)) {
    try {
      frameSrc = await prepareFrameOverlayForExport(frameUrl, layoutBoxes, canvas)
    } catch {
      frameSrc = frameUrl
    }
  }

  const frame = await loadImage(frameSrc)
  const cw = Math.max(1, Number(canvas.width) || 1)
  const ch = Math.max(1, Number(canvas.height) || 1)
  const fw = frame.naturalWidth || frame.width || cw
  const fh = frame.naturalHeight || frame.height || ch

  const fit = getObjectContainFit({ width: cw, height: ch }, { width: fw, height: fh })
  const x = (fit.left / 100) * cw
  const y = (fit.top / 100) * ch
  const dw = (fit.width / 100) * cw
  const dh = (fit.height / 100) * ch

  ctx.drawImage(frame, x, y, dw, dh)
  return true
}

/**
 * Render the full customer design (all collage slots + frame overlay) to a JPEG blob.
 * Used when saving to cart / orders so preview and download match the designer.
 */
export async function composeDesignPreview({
  product,
  variant,
  options = {},
  slotPhotos = [],
  design = {},
  photoUrl,
  quality = 0.92,
  format = 'jpeg',
  frameColor,
  frameThicknessPx,
}) {
  const sources = resolvePhotoSources({ slotPhotos, design, photoUrl })
  if (!sources.some((entry) => entry.url)) {
    throw new Error('Upload at least one photo before adding to cart')
  }

  const { frameUrl, canvas, layoutBoxes, useCollageSlots } = await resolveExportLayout(
    product,
    variant,
    options,
  )

  const w = Math.max(1, Number(canvas.width) || 1000)
  const h = Math.max(1, Number(canvas.height) || 1000)
  const el = document.createElement('canvas')
  el.width = w
  el.height = h
  const ctx = el.getContext('2d')

  const showClock = shouldShowClockDial(product, options, variant)
  const primaryBox = layoutBoxes[0]

  if (!frameUrl && showClock) {
    drawCssClockFrame(ctx, canvas, {
      frameColor: frameColor || options.frameColor || '#111111',
      thicknessPx: frameThicknessPx || 12,
    })
  } else {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
  }

  const loadedPhotos = await Promise.all(
    layoutBoxes.map(async (_, index) => {
      const src = sources[index]?.url || sources[0]?.url
      if (!src) return null
      try {
        return await loadImage(src)
      } catch {
        return null
      }
    }),
  )

  const photosUnderFrame = Boolean(frameUrl)

  if (photosUnderFrame) {
    for (let i = 0; i < layoutBoxes.length; i += 1) {
      const img = loadedPhotos[i]
      if (!img) continue
      const crop = sources[i]?.crop || sources[0]?.crop || design.crop
      drawPhotoInBox(ctx, img, layoutBoxes[i], crop)
    }

    if (showClock && primaryBox) {
      drawClockFace(ctx, primaryBox, options)
    }

    try {
      await drawFrameOverlay(ctx, frameUrl, canvas, layoutBoxes)
    } catch {
      /* keep photos-only export if frame fails */
    }
  } else {
    for (let i = 0; i < layoutBoxes.length; i += 1) {
      const img = loadedPhotos[i]
      if (!img) continue
      const crop = sources[i]?.crop || sources[0]?.crop || design.crop
      drawPhotoInBox(ctx, img, layoutBoxes[i], crop)
    }

    if (showClock && primaryBox) {
      drawClockFace(ctx, primaryBox, options)
    }
  }

  const mime = format === 'png' ? 'image/png' : 'image/jpeg'

  return new Promise((resolve, reject) => {
    el.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not compose design preview'))
          return
        }
        resolve({ blob, width: w, height: h })
      },
      mime,
      quality,
    )
  })
}

export async function composeAndUploadDesignPreview(params, uploadPhoto) {
  const { blob } = await composeDesignPreview(params)
  const slug = params.product?.slug || 'design'
  const file = new File([blob], `${slug}-design-${Date.now()}.jpg`, { type: 'image/jpeg' })
  const payload = await uploadPhoto(file)
  const asset = payload?.asset || payload
  return asset?.optimizedUrl || asset?.url || asset?.previewUrl || ''
}
