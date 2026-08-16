import { parseSvgDimensions } from './mockupAnalyzer'
import { resolveMediaUrl } from './mediaUrl'

const frameDimensionCache = new Map()
const frameDimensionInflight = new Map()

export function loadImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width || 1000,
        height: img.naturalHeight || img.height || 1000,
      })
    }
    img.onerror = () => reject(new Error('Could not read frame dimensions'))
    img.src = resolveMediaUrl(url)
  })
}

/** Authoritative frame size — SVG viewBox (not browser naturalWidth which can differ). */
export async function getFrameDimensions(url) {
  const resolved = resolveMediaUrl(url)
  if (!resolved) return { width: 1000, height: 1000 }

  if (frameDimensionCache.has(resolved)) {
    return frameDimensionCache.get(resolved)
  }
  if (frameDimensionInflight.has(resolved)) {
    return frameDimensionInflight.get(resolved)
  }

  const task = (async () => {
    const isSvg = resolved.toLowerCase().includes('.svg')
    if (isSvg) {
      try {
        const res = await fetch(resolved)
        const svgText = await res.text()
        const dims = parseSvgDimensions(svgText)
        frameDimensionCache.set(resolved, dims)
        return dims
      } catch {
        /* fall through to raster probe */
      }
    }

    const dims = await loadImageDimensions(resolved)
    frameDimensionCache.set(resolved, dims)
    return dims
  })().finally(() => {
    frameDimensionInflight.delete(resolved)
  })

  frameDimensionInflight.set(resolved, task)
  return task
}

export function scalePhotoBox(box, sourceCanvas, targetCanvas) {
  if (!box) return box
  const sw = Number(sourceCanvas?.width) || Number(targetCanvas?.width) || 1
  const sh = Number(sourceCanvas?.height) || Number(targetCanvas?.height) || 1
  const tw = Number(targetCanvas?.width) || sw
  const th = Number(targetCanvas?.height) || sh
  const sx = tw / sw
  const sy = th / sh
  const scaleRadius = Math.min(sx, sy)

  return {
    ...box,
    x: (Number(box.x) || 0) * sx,
    y: (Number(box.y) || 0) * sy,
    width: (Number(box.width) || 0) * sx,
    height: (Number(box.height) || 0) * sy,
    borderRadius: box.borderRadius ? Number(box.borderRadius) * scaleRadius : box.borderRadius,
    rotate: box.rotate || 0,
  }
}

export function scalePhotoBoxes(boxes = [], sourceCanvas, targetCanvas) {
  return boxes.map((box) => scalePhotoBox(box, sourceCanvas, targetCanvas))
}

/** Where object-contain draws the frame inside a canvas-aspect stage (% of stage). */
export function getObjectContainFit(stageCanvas, frameCanvas) {
  const sw = Number(stageCanvas?.width) || 1
  const sh = Number(stageCanvas?.height) || 1
  const fw = Number(frameCanvas?.width) || sw
  const fh = Number(frameCanvas?.height) || sh
  const stageAspect = sw / sh
  const frameAspect = fw / fh

  if (Math.abs(stageAspect - frameAspect) < 0.002) {
    return { left: 0, top: 0, width: 100, height: 100 }
  }

  if (frameAspect > stageAspect) {
    const heightPct = (stageAspect / frameAspect) * 100
    return { left: 0, top: (100 - heightPct) / 2, width: 100, height: heightPct }
  }

  const widthPct = (frameAspect / stageAspect) * 100
  return { left: (100 - widthPct) / 2, top: 0, width: widthPct, height: 100 }
}

/** Align photo slots with object-contain frame rendering (matches admin MockupEditor). */
export async function resolveMockupLayout(frameImage, mockupCanvas, photoBoxes) {
  const boxes = photoBoxes?.length ? photoBoxes : []
  const sourceCanvas = mockupCanvas?.width
    ? mockupCanvas
    : { width: 1000, height: 1000 }

  if (!frameImage) {
    const fit = getObjectContainFit(sourceCanvas, sourceCanvas)
    return { canvas: sourceCanvas, photoBoxes: boxes, frameCanvas: sourceCanvas, fit }
  }

  try {
    const frameCanvas = await getFrameDimensions(frameImage)
    const fit = getObjectContainFit(sourceCanvas, frameCanvas)
    return {
      canvas: sourceCanvas,
      frameCanvas,
      photoBoxes: boxes,
      fit,
    }
  } catch {
    const fit = getObjectContainFit(sourceCanvas, sourceCanvas)
    return { canvas: sourceCanvas, frameCanvas: sourceCanvas, photoBoxes: boxes, fit }
  }
}

export function photoBoxToStyle(box, canvas, options = {}) {
  const cw = Number(canvas?.width) || 1
  const ch = Number(canvas?.height) || 1
  const radius = Number(box.borderRadius) || 0

  const style = {
    position: 'absolute',
    left: `${((Number(box.x) || 0) / cw) * 100}%`,
    top: `${((Number(box.y) || 0) / ch) * 100}%`,
    width: `${((Number(box.width) || 0) / cw) * 100}%`,
    height: `${((Number(box.height) || 0) / ch) * 100}%`,
    borderRadius: radius ? `${radius}px` : undefined,
    transform: box.rotate ? `rotate(${box.rotate}deg)` : undefined,
    transformOrigin: 'center center',
    overflow: 'hidden',
    isolation: 'isolate',
    contain: 'paint',
    background: options.transparent ? 'transparent' : '#f3f4f6',
    ...(box.clipPath ? { clipPath: box.clipPath, WebkitClipPath: box.clipPath } : {}),
  }

  return applyObjectContainFit(style, options.fit)
}

/** Map canvas-percent slot coords into the letterboxed object-contain frame area */
export function applyObjectContainFit(style, fit) {
  if (!fit || (fit.left === 0 && fit.top === 0 && fit.width === 100 && fit.height === 100)) {
    return style
  }

  const leftPct = parseFloat(style.left) || 0
  const topPct = parseFloat(style.top) || 0
  const widthPct = parseFloat(style.width) || 0
  const heightPct = parseFloat(style.height) || 0

  return {
    ...style,
    left: `${fit.left + (leftPct / 100) * fit.width}%`,
    top: `${fit.top + (topPct / 100) * fit.height}%`,
    width: `${(widthPct / 100) * fit.width}%`,
    height: `${(heightPct / 100) * fit.height}%`,
  }
}
