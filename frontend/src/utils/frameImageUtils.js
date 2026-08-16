import { resolveMediaUrl } from './mediaUrl'

const ALPHA_WINDOW = 128
const CLIP_MIN_FILL = 0.28
const CLIP_MAX_FILL = 0.92
const CLIP_RAY_STEPS = 72
const clipPathCache = new Map()

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load frame image'))
    img.src = url
  })
}

/** SVG/PNG/WebP frames usually already have transparent photo windows — don't rasterize/punch */
export function shouldPunchFrameHoles(frameUrl) {
  const url = String(resolveMediaUrl(frameUrl) || frameUrl || '').toLowerCase()
  if (url.includes('.svg')) return false
  if (url.includes('.png')) return false
  if (url.includes('.webp')) return false
  return true
}

/**
 * Built-in / lifestyle collage mockups (path-traced SVG or sample-filled art)
 * need full slot rectangles cleared so customer photos show through.
 */
export function needsForcedPhotoWindowCut(frameUrl) {
  const url = String(resolveMediaUrl(frameUrl) || frameUrl || '').toLowerCase()
  return url.includes('frame-collage')
}

const cutWindowCache = new Map()
const transparencyCache = new Map()

/**
 * Sample photo-slot centers — true when the frame already has see-through windows
 * (like the hex acrylic PNG). Opaque lifestyle mockups return false.
 */
export async function frameSlotsAreTransparent(
  frameUrl,
  photoBoxes = [],
  canvas = { width: 1000, height: 1000 },
) {
  const resolved = resolveMediaUrl(frameUrl)
  if (!resolved || !photoBoxes?.length) return false

  const cacheKey = `${resolved}|${canvas.width}x${canvas.height}|${photoBoxes
    .map((b) => `${b.x},${b.y},${b.width},${b.height}`)
    .join(';')}`
  if (transparencyCache.has(cacheKey)) return transparencyCache.get(cacheKey)

  try {
    const img = await loadImage(resolved)
    const w = img.naturalWidth || Number(canvas.width) || 1000
    const h = img.naturalHeight || Number(canvas.height) || 1000
    const refW = Number(canvas.width) || w
    const refH = Number(canvas.height) || h
    const scaleX = w / refW
    const scaleY = h / refH

    const el = document.createElement('canvas')
    el.width = w
    el.height = h
    const ctx = el.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, w, h)
    const { data } = ctx.getImageData(0, 0, w, h)

    let transparentSlots = 0
    for (const box of photoBoxes) {
      const cx = Math.round(((Number(box.x) || 0) + (Number(box.width) || 0) / 2) * scaleX)
      const cy = Math.round(((Number(box.y) || 0) + (Number(box.height) || 0) / 2) * scaleY)
      const samples = [
        [cx, cy],
        [cx - 4, cy],
        [cx + 4, cy],
        [cx, cy - 4],
        [cx, cy + 4],
      ]
      let hits = 0
      for (const [x, y] of samples) {
        if (x < 0 || y < 0 || x >= w || y >= h) continue
        if (data[(y * w + x) * 4 + 3] < 140) hits += 1
      }
      if (hits >= 3) transparentSlots += 1
    }

    const ok = transparentSlots >= Math.ceil(photoBoxes.length * 0.6)
    transparencyCache.set(cacheKey, ok)
    return ok
  } catch {
    transparencyCache.set(cacheKey, false)
    return false
  }
}

/**
 * Cut fully transparent windows in the frame overlay at each photo slot.
 * Photos sit under the frame and show only through these holes.
 */
export async function cutFramePhotoWindows(
  frameUrl,
  photoBoxes = [],
  canvas = { width: 1000, height: 1000 },
  { inset = 2 } = {},
) {
  const resolved = resolveMediaUrl(frameUrl)
  if (!resolved || !photoBoxes?.length) return resolved

  const cacheKey = `${resolved}|${canvas.width}x${canvas.height}|${inset}|${photoBoxes
    .map((b) => `${b.x},${b.y},${b.width},${b.height},${b.rotate || 0}`)
    .join(';')}`
  if (cutWindowCache.has(cacheKey)) return cutWindowCache.get(cacheKey)

  const img = await loadImage(resolved)
  const w = img.naturalWidth || Number(canvas.width) || 1000
  const h = img.naturalHeight || Number(canvas.height) || 1000
  const refW = Number(canvas.width) || w
  const refH = Number(canvas.height) || h
  const scaleX = w / refW
  const scaleY = h / refH

  const el = document.createElement('canvas')
  el.width = w
  el.height = h
  const ctx = el.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)

  for (const box of photoBoxes) {
    const x = Math.max(0, Math.floor((Number(box.x) || 0) * scaleX) + inset)
    const y = Math.max(0, Math.floor((Number(box.y) || 0) * scaleY) + inset)
    const bw = Math.max(0, Math.ceil((Number(box.width) || 0) * scaleX) - inset * 2)
    const bh = Math.max(0, Math.ceil((Number(box.height) || 0) * scaleY) - inset * 2)
    if (bw < 2 || bh < 2) continue

    const rotate = Number(box.rotate) || 0
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    if (rotate) {
      const cx = x + bw / 2
      const cy = y + bh / 2
      ctx.translate(cx, cy)
      ctx.rotate((rotate * Math.PI) / 180)
      ctx.fillRect(-bw / 2, -bh / 2, bw, bh)
    } else {
      ctx.fillRect(x, y, bw, bh)
    }
    ctx.restore()
  }

  const dataUrl = el.toDataURL('image/png')
  cutWindowCache.set(cacheKey, dataUrl)
  return dataUrl
}

/**
 * Cut transparent holes in frame overlay where customer photos go.
 * Handles JPG mockups with black placeholder boxes (not just PNG transparency).
 */
export async function punchFrameHoles(frameUrl, photoBoxes = [], canvas = { width: 1000, height: 1000 }) {
  if (needsForcedPhotoWindowCut(frameUrl)) {
    return cutFramePhotoWindows(frameUrl, photoBoxes, canvas)
  }

  const resolved = resolveMediaUrl(frameUrl)
  if (!resolved || !photoBoxes?.length) return resolved

  const img = await loadImage(resolved)
  const w = img.naturalWidth || Number(canvas.width) || 1000
  const h = img.naturalHeight || Number(canvas.height) || 1000
  const refW = Number(canvas.width) || w
  const refH = Number(canvas.height) || h
  const scaleX = w / refW
  const scaleY = h / refH

  const el = document.createElement('canvas')
  el.width = w
  el.height = h
  const ctx = el.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)

  const { data } = ctx.getImageData(0, 0, w, h)
  const pad = 2

  for (const box of photoBoxes) {
    const x0 = Math.max(0, Math.floor((Number(box.x) || 0) * scaleX) + pad)
    const y0 = Math.max(0, Math.floor((Number(box.y) || 0) * scaleY) + pad)
    const x1 = Math.min(w, Math.ceil(((Number(box.x) || 0) + (Number(box.width) || 0)) * scaleX) - pad)
    const y1 = Math.min(h, Math.ceil(((Number(box.y) || 0) + (Number(box.height) || 0)) * scaleY) - pad)

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]
        if (a < 140 || (r < 75 && g < 75 && b < 75)) {
          data[i + 3] = 0
        }
      }
    }
  }

  ctx.putImageData(new ImageData(data, w, h), 0, 0)
  return el.toDataURL('image/png')
}

function isTransparentWindow(data, canvasW, x, y) {
  const i = (y * canvasW + x) * 4
  return data[i + 3] < ALPHA_WINDOW
}

function isLightBlankWindow(data, canvasW, x, y) {
  const i = (y * canvasW + x) * 4
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const a = data[i + 3]
  if (a < ALPHA_WINDOW) return false

  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  if (lum < 165) return false

  const maxC = Math.max(r, g, b)
  const minC = Math.min(r, g, b)
  const sat = maxC - minC

  if (lum >= 228 && sat < 48) return true
  if (lum >= 170 && sat < 110 && g >= r - 10 && g >= b - 10) return true
  return lum >= 248 && sat < 28
}

function isPhotoWindowPixel(data, canvasW, x, y) {
  return isTransparentWindow(data, canvasW, x, y) || isLightBlankWindow(data, canvasW, x, y)
}

function findWindowCentroid(data, canvasW, x0, y0, x1, y1) {
  let sumX = 0
  let sumY = 0
  let count = 0

  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      if (isPhotoWindowPixel(data, canvasW, x, y)) {
        sumX += x
        sumY += y
        count += 1
      }
    }
  }

  if (!count) return null
  return { x: sumX / count, y: sumY / count }
}

/** Main photo window only — excludes corner gaps outside an organic frame outline. */
function buildConnectedWindowMask(data, canvasW, x0, y0, x1, y1, seedX, seedY) {
  const bw = x1 - x0
  const bh = y1 - y0
  const mask = new Uint8Array(bw * bh)
  if (!isPhotoWindowPixel(data, canvasW, seedX, seedY)) return mask

  const stack = [[seedX, seedY]]
  const visited = new Uint8Array(bw * bh)

  while (stack.length) {
    const [x, y] = stack.pop()
    if (x < x0 || y < y0 || x >= x1 || y >= y1) continue

    const local = (y - y0) * bw + (x - x0)
    if (visited[local]) continue
    if (!isPhotoWindowPixel(data, canvasW, x, y)) continue

    visited[local] = 1
    mask[local] = 1
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }

  return mask
}

function maskPixel(mask, bw, x, y, x0, y0, x1, y1) {
  if (x < x0 || y < y0 || x >= x1 || y >= y1) return false
  return mask[(y - y0) * bw + (x - x0)] === 1
}

/** Trace the photo window outline when the slot bbox is non-rectangular (pebble, heart, etc.). */
export function inferSlotClipPathFromPixels(data, canvasW, canvasH, box) {
  if (box?.clipPath) return box.clipPath

  const x0 = Math.max(0, Math.floor(Number(box.x) || 0))
  const y0 = Math.max(0, Math.floor(Number(box.y) || 0))
  const x1 = Math.min(canvasW, Math.ceil((Number(box.x) || 0) + (Number(box.width) || 0)))
  const y1 = Math.min(canvasH, Math.ceil((Number(box.y) || 0) + (Number(box.height) || 0)))
  const bw = x1 - x0
  const bh = y1 - y0
  if (bw < 12 || bh < 12) return null

  const centroid =
    findWindowCentroid(data, canvasW, x0, y0, x1, y1) ||
    { x: x0 + bw / 2, y: y0 + bh / 2 }

  const seedX = Math.round(centroid.x)
  const seedY = Math.round(centroid.y)
  const windowMask = buildConnectedWindowMask(data, canvasW, x0, y0, x1, y1, seedX, seedY)

  let windowCount = 0
  for (let i = 0; i < windowMask.length; i += 1) {
    if (windowMask[i]) windowCount += 1
  }

  const fillRatio = windowCount / (bw * bh)
  if (fillRatio >= CLIP_MAX_FILL || fillRatio < CLIP_MIN_FILL) return null

  const points = []
  const maxR = Math.max(bw, bh) * 0.75

  for (let i = 0; i < CLIP_RAY_STEPS; i += 1) {
    const angle = (i / CLIP_RAY_STEPS) * Math.PI * 2
    const dx = Math.cos(angle)
    const dy = Math.sin(angle)
    let edgeX = seedX
    let edgeY = seedY

    for (let r = 1; r <= maxR; r += 1) {
      const x = Math.round(seedX + dx * r)
      const y = Math.round(seedY + dy * r)
      if (x < x0 || y < y0 || x >= x1 || y >= y1) break
      if (!maskPixel(windowMask, bw, x, y, x0, y0, x1, y1)) {
        edgeX = Math.round(seedX + dx * (r - 1))
        edgeY = Math.round(seedY + dy * (r - 1))
        break
      }
      edgeX = x
      edgeY = y
    }

    points.push([((edgeX - x0) / bw) * 100, ((edgeY - y0) / bh) * 100])
  }

  if (points.length < 8) return null

  const inset = 1.5
  const pct = points
    .map(([px, py]) => {
      const ix = Math.min(100, Math.max(0, px))
      const iy = Math.min(100, Math.max(0, py))
      const cx = 50
      const cy = 50
      const nx = cx + (ix - cx) * (1 - inset / 50)
      const ny = cy + (iy - cy) * (1 - inset / 50)
      return `${nx.toFixed(1)}% ${ny.toFixed(1)}%`
    })
    .join(', ')

  return `polygon(${pct})`
}

async function readFramePixels(frameUrl, canvas) {
  const resolved = resolveMediaUrl(frameUrl)
  const img = await loadImage(resolved)
  const refW = Number(canvas?.width) || img.naturalWidth || 1000
  const refH = Number(canvas?.height) || img.naturalHeight || 1000
  const el = document.createElement('canvas')
  el.width = refW
  el.height = refH
  const ctx = el.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, refW, refH)
  return ctx.getImageData(0, 0, refW, refH)
}

/** Add clipPath to photo slots that follow irregular frame windows (pebble, organic shapes). */
export async function inferSlotClipPathsFromFrame(frameUrl, photoBoxes = [], canvas = { width: 1000, height: 1000 }) {
  if (!frameUrl || !photoBoxes?.length) return photoBoxes

  const cacheKey = `${resolveMediaUrl(frameUrl)}|${canvas.width}x${canvas.height}|${photoBoxes
    .map((b) => `${b.x},${b.y},${b.width},${b.height}`)
    .join(';')}`
  if (clipPathCache.has(cacheKey)) return clipPathCache.get(cacheKey)

  try {
    const { data, width, height } = await readFramePixels(frameUrl, canvas)
    const enhanced = photoBoxes.map((box) => {
      if (box.clipPath) return box
      const clipPath = inferSlotClipPathFromPixels(data, width, height, box)
      return clipPath ? { ...box, borderRadius: 0, clipPath } : box
    })
    clipPathCache.set(cacheKey, enhanced)
    return enhanced
  } catch {
    return photoBoxes
  }
}

/**
 * Prepare frame overlay for cart/order export — clears entire photo slot rects
 * so customer photos show through even when the template JPG has sample images inside.
 */
export async function prepareFrameOverlayForExport(frameUrl, photoBoxes = [], canvas = { width: 1000, height: 1000 }) {
  const resolved = resolveMediaUrl(frameUrl)
  if (!resolved || !photoBoxes?.length) return resolved

  if (needsForcedPhotoWindowCut(frameUrl) || shouldPunchFrameHoles(frameUrl)) {
    return cutFramePhotoWindows(frameUrl, photoBoxes, canvas, { inset: 1 })
  }

  return resolved
}
