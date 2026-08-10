import { resolveMediaUrl } from '../utils/mediaUrl'
import { LAYER_IDS } from './constants'

const imageCache = new Map()

function loadCached(url) {
  const key = resolveMediaUrl(url)
  if (!key) return Promise.resolve(null)
  if (imageCache.has(key)) return imageCache.get(key)
  const promise = new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Load failed: ${key}`))
    img.src = key
  })
  imageCache.set(key, promise)
  return promise
}

function drawSlotPhoto(ctx, slot, img, canvas) {
  const t = slot.transform || {}
  const cx = slot.x + slot.width / 2 + (t.x || 0) * slot.width
  const cy = slot.y + slot.height / 2 + (t.y || 0) * slot.height
  const scale = Math.max(0.2, t.scale || 1)
  const rotate = ((t.rotate || 0) * Math.PI) / 180

  ctx.save()
  ctx.beginPath()
  if (slot.borderRadius) {
    const r = Math.min(slot.borderRadius, slot.width / 2, slot.height / 2)
    const x = slot.x
    const y = slot.y
    const w = slot.width
    const h = slot.height
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  } else {
    ctx.rect(slot.x, slot.y, slot.width, slot.height)
  }
  ctx.clip()

  ctx.translate(cx, cy)
  ctx.rotate(rotate)
  ctx.scale(t.flipX ? -scale : scale, t.flipY ? -scale : scale)

  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const coverScale = Math.max(slot.width / iw, slot.height / ih) * scale
  const dw = iw * coverScale
  const dh = ih * coverScale
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
  ctx.restore()
}

/**
 * Composite render pipeline:
 * Background → Customer Images (masked) → Shadow → Frame → Reflection
 */
export async function renderSmartMockup(state, options = {}) {
  const {
    canvas,
    slots = [],
    frameUrl,
    overlayUrl,
    maskUrl,
    layerVisibility = {},
    background = '#f3f4f6',
  } = state

  const w = canvas.width
  const h = canvas.height
  const el = document.createElement('canvas')
  el.width = w
  el.height = h
  const ctx = el.getContext('2d')

  const show = (id) => layerVisibility[id] !== false

  if (show(LAYER_IDS.BACKGROUND)) {
    const grd = ctx.createLinearGradient(0, 0, w, h)
    grd.addColorStop(0, background)
    grd.addColorStop(1, '#e5e7eb')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, w, h)
  }

  if (show(LAYER_IDS.SHADOW)) {
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.08)'
    ctx.filter = 'blur(12px)'
    ctx.fillRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92)
    ctx.restore()
  }

  if (show(LAYER_IDS.CUSTOMER_IMAGE)) {
    for (const slot of slots) {
      if (!slot.photoUrl) continue
      try {
        const img = await loadCached(slot.photoUrl)
        drawSlotPhoto(ctx, slot, img, canvas)
      } catch {
        /* skip broken slot image */
      }
    }
  }

  if (show(LAYER_IDS.MASK) && maskUrl) {
    try {
      const mask = await loadCached(maskUrl)
      ctx.globalCompositeOperation = 'destination-in'
      ctx.drawImage(mask, 0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
    } catch {
      /* optional mask */
    }
  }

  const frameSrc = overlayUrl || frameUrl
  if (show(LAYER_IDS.FRAME) && frameSrc) {
    try {
      const frame = await loadCached(frameSrc)
      ctx.drawImage(frame, 0, 0, w, h)
    } catch {
      /* frame optional during load */
    }
  }

  if (show(LAYER_IDS.REFLECTION)) {
    ctx.save()
    ctx.globalAlpha = 0.12
    ctx.fillStyle = 'linear-gradient(180deg, transparent, white)'
    const grd = ctx.createLinearGradient(0, 0, 0, h)
    grd.addColorStop(0, 'rgba(255,255,255,0.3)')
    grd.addColorStop(0.5, 'transparent')
    grd.addColorStop(1, 'rgba(0,0,0,0.05)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }

  const format = options.format || 'png'
  const quality = options.quality ?? 0.92
  const mime =
    format === 'webp' ? 'image/webp' : format === 'jpeg' ? 'image/jpeg' : 'image/png'

  return new Promise((resolve) => {
    el.toBlob((blob) => {
      resolve({
        blob,
        dataUrl: blob ? URL.createObjectURL(blob) : el.toDataURL(mime, quality),
        width: w,
        height: h,
      })
    }, mime, quality)
  })
}

export async function exportSmartMockupVariants(state) {
  const [png, webp, thumb] = await Promise.all([
    renderSmartMockup(state, { format: 'png' }),
    renderSmartMockup(state, { format: 'webp', quality: 0.85 }),
    renderSmartMockup(
      {
        ...state,
        canvas: {
          width: Math.round(state.canvas.width * 0.35),
          height: Math.round(state.canvas.height * 0.35),
        },
      },
      { format: 'webp', quality: 0.8 },
    ),
  ])
  return {
    merged: png.dataUrl,
    png: png.dataUrl,
    webp: webp.dataUrl,
    thumbnail: thumb.dataUrl,
  }
}

export function clearImageCache() {
  imageCache.clear()
}
