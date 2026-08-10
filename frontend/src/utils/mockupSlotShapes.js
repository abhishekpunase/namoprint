/** Hex / honeycomb photo windows — clip uploads to the frame cutout shape */



const HEX_FILL_RATIO_MAX = 0.84



export function isHexLikeFillRatio(fillRatio) {

  const r = Number(fillRatio)

  return r > 0.45 && r < HEX_FILL_RATIO_MAX

}



export function inferHexClipPath(box) {

  const w = Number(box.width) || 1

  const h = Number(box.height) || 1

  const flatTop = w > h * 1.08



  if (flatTop) {

    return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'

  }

  return 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

}



/** Match photo slot to frame hex — slight bleed so no white gap inside the border */

export function applyHexSlotClip(box, expandRatio = 0.05) {

  if (!box) return box



  const padX = Number(box.width) * expandRatio

  const padY = Number(box.height) * expandRatio

  const fitted = {

    ...box,

    x: Math.round((Number(box.x) || 0) - padX),

    y: Math.round((Number(box.y) || 0) - padY),

    width: Math.round(Math.max(8, Number(box.width) + padX * 2)),

    height: Math.round(Math.max(8, Number(box.height) + padY * 2)),

    rotate: box.rotate || 0,

    borderRadius: 0,

  }



  return {

    ...fitted,

    clipPath: inferHexClipPath(fitted),

  }

}



export function enhanceHexSlotBox(box, fillRatio, expandRatio = 0.05) {

  return applyHexSlotClip(box, expandRatio)

}



/** Strip hex/organic clip paths — photo slots stay rectangular from frame detection. */
export function normalizeRectPhotoSlot(box) {
  if (!box) return box
  const { clipPath: _clipPath, fillRatio: _fillRatio, ...rest } = box
  return {
    ...rest,
    rotate: rest.rotate || 0,
    borderRadius: Number(rest.borderRadius) || 0,
  }
}

export function normalizeRectPhotoSlots(photoBoxes = []) {
  if (!Array.isArray(photoBoxes)) return []
  return photoBoxes.map(normalizeRectPhotoSlot)
}

/** True when the product is a honeycomb / hex collage frame (not generic multi-photo grids). */
export function isHexFrameProduct(product) {
  if (!product) return false
  if (product.mockup?.slotShape === 'hex') return true
  if (product.mockup?.slotShape === 'rect') return false

  const text = [product.title, product.slug, product.description].filter(Boolean).join(' ').toLowerCase()
  return /\b(hex|hexa|hexagonal|honeycomb)\b/.test(text)
}

/** Apply hex clip only when the slot shape (or product) is hex — otherwise keep square/rect. */
export function finalizePhotoSlot(box, { forceHex = false } = {}) {
  if (!box) return box
  if (box.clipPath && isHexClipPath(box.clipPath)) return box

  const fillRatio = Number(box.fillRatio)
  const shouldHex =
    forceHex ||
    box.slotShape === 'hex' ||
    (Number.isFinite(fillRatio) && fillRatio > 0 && isHexLikeFillRatio(fillRatio))

  if (shouldHex) {
    return applyHexSlotClip(box, fillRatio ? 0.03 : 0.05)
  }

  return normalizeRectPhotoSlot(box)
}

export function finalizePhotoSlots(photoBoxes = [], product = null) {
  if (!Array.isArray(photoBoxes) || !photoBoxes.length) return []
  const forceHexAll = isHexFrameProduct(product)
  return photoBoxes.map((box) => finalizePhotoSlot(box, { forceHex: forceHexAll }))
}

/** Never blanket-apply hex to every slot — use finalizePhotoSlots instead. */
export function ensureHoneycombClipPaths(photoBoxes = [], product = null) {
  return finalizePhotoSlots(photoBoxes, product)
}



export function clipPathFromPolygonPoints(pointsStr, canvasWidth, canvasHeight) {

  if (!pointsStr?.trim()) return null



  const pairs = pointsStr

    .trim()

    .split(/\s+/)

    .map((pair) => pair.split(/[, ]+/).map(Number).filter((n) => !Number.isNaN(n)))

    .filter((pair) => pair.length >= 2)



  if (pairs.length < 3) return null



  const xs = pairs.map((p) => p[0])

  const ys = pairs.map((p) => p[1])

  const minX = Math.min(...xs)

  const maxX = Math.max(...xs)

  const minY = Math.min(...ys)

  const maxY = Math.max(...ys)

  const w = Math.max(1, maxX - minX)

  const h = Math.max(1, maxY - minY)



  if (w / canvasWidth > 0.85 && h / canvasHeight > 0.85) return null



  const pctPoints = pairs

    .map(([x, y]) => {

      const px = ((x - minX) / w) * 100

      const py = ((y - minY) / h) * 100

      return `${px.toFixed(2)}% ${py.toFixed(2)}%`

    })

    .join(', ')



  return {

    x: Math.round(minX),

    y: Math.round(minY),

    width: Math.round(w),

    height: Math.round(h),

    rotate: 0,

    borderRadius: 0,

    clipPath: `polygon(${pctPoints})`,

  }

}



export const HEX_PHOTO_FILL_SCALE = 1.18



/** Used by preview/export — hex clip detection */

export function isHexClipPath(clipPath) {

  if (!clipPath?.startsWith('polygon(')) return false

  const inner = clipPath.slice(8, -1).trim()

  if (!inner) return false

  if (inner.split(',').length !== 6) return false

  return (

    clipPath === 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' ||

    clipPath === 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

  )

}


