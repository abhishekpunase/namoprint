import {
  clipPathFromPolygonPoints,
  applyHexSlotClip,
  isHexLikeFillRatio,
  normalizeRectPhotoSlot,
} from './mockupSlotShapes'
import { filterSignificantPhotoBoxes } from '../data/collageFrameMockup'
import { inferSlotClipPathFromPixels } from './frameImageUtils'

const ALPHA_THRESHOLD = 128
/** Minimum transparent pixels inside a slot (scales with image size) */
const MIN_REGION_PIXEL_RATIO = 0.0015
/** Slot bounding box must be at least this fraction of canvas */
const MIN_BBOX_RATIO = 0.008
/** Transparent fill must cover at least this much of the slot bbox */
const MIN_FILL_RATIO = 0.3
const MAX_REGIONS = 24
const MAX_ANALYZE_DIMENSION = 2000

function pixelAt(imageData, width, x, y) {
  const i = (y * width + x) * 4
  return {
    r: imageData[i],
    g: imageData[i + 1],
    b: imageData[i + 2],
    a: imageData[i + 3],
  }
}

function isWhitePlaceholderPixel(imageData, width, x, y) {
  const { r, g, b, a } = pixelAt(imageData, width, x, y)
  if (a < ALPHA_THRESHOLD) return false
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  const sat = Math.max(r, g, b) - Math.min(r, g, b)
  if (lum >= 220 && sat < 52) return true
  if (lum >= 245 && sat < 36) return true
  return false
}

/** Light/mid grey flat placeholders used in collage JPG/PNG mockups. */
function isLightGrayPlaceholderPixel(imageData, width, x, y) {
  const { r, g, b, a } = pixelAt(imageData, width, x, y)
  if (a < ALPHA_THRESHOLD) return false
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  const sat = Math.max(r, g, b) - Math.min(r, g, b)
  // Typical slot fills: #BEBEBE–#F0F0F0 (and soft off-white)
  if (lum < 155 || lum > 248) return false
  if (sat > 42) return false
  return true
}

function isLightGreenPlaceholderPixel(imageData, width, x, y) {
  const { r, g, b, a } = pixelAt(imageData, width, x, y)
  if (a < ALPHA_THRESHOLD) return false
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  if (lum < 155 || lum > 245) return false
  const sat = Math.max(r, g, b) - Math.min(r, g, b)
  return sat < 115 && g >= r - 10 && g >= b - 10
}

function isBlankPlaceholderPixel(imageData, width, x, y) {
  return (
    isWhitePlaceholderPixel(imageData, width, x, y) ||
    isLightGrayPlaceholderPixel(imageData, width, x, y) ||
    isLightGreenPlaceholderPixel(imageData, width, x, y)
  )
}

/**
 * Keep solid photo windows, drop thin white text strokes on patterned backgrounds.
 * A blank pixel must also have mostly blank neighbors in a small radius.
 */
function makeSolidBlankTester(imageData, width, height, isBlank, radius = 2, minRatio = 0.72) {
  return (x, y) => {
    if (!isBlank(x, y)) return false
    let blank = 0
    let total = 0
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        total += 1
        if (isBlank(nx, ny)) blank += 1
      }
    }
    return total > 0 && blank / total >= minRatio
  }
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load mockup image'))
    img.src = url
  })
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image file'))
    }
    img.src = url
  })
}

function loadSvgAsImage(svgText) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not rasterize SVG'))
    }
    img.src = url
  })
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Could not read SVG file'))
    reader.readAsText(file)
  })
}

function defaultInsetBox(width, height, insetRatio = 0.12) {
  const insetX = Math.round(width * insetRatio)
  const insetY = Math.round(height * insetRatio)
  return {
    x: insetX,
    y: insetY,
    width: Math.max(1, width - insetX * 2),
    height: Math.max(1, height - insetY * 2),
    rotate: 0,
    borderRadius: 0,
  }
}

function regionIoU(a, b) {
  const x0 = Math.max(a.x, b.x)
  const y0 = Math.max(a.y, b.y)
  const x1 = Math.min(a.x + a.width, b.x + b.width)
  const y1 = Math.min(a.y + a.height, b.y + b.height)
  if (x1 <= x0 || y1 <= y0) return 0
  const inter = (x1 - x0) * (y1 - y0)
  const union = a.width * a.height + b.width * b.height - inter
  return union > 0 ? inter / union : 0
}

function dedupeRegions(regions, iouThreshold = 0.55) {
  const sorted = [...regions].sort((a, b) => (b.area || b.width * b.height) - (a.area || a.width * a.height))
  const kept = []
  for (const region of sorted) {
    const duplicate = kept.some((entry) => {
      const iou = regionIoU(entry, region)
      if (iou > iouThreshold) return true
      const cx1 = entry.x + entry.width / 2
      const cy1 = entry.y + entry.height / 2
      const cx2 = region.x + region.width / 2
      const cy2 = region.y + region.height / 2
      const dist = Math.hypot(cx1 - cx2, cy1 - cy2)
      const minSide = Math.min(entry.width, entry.height, region.width, region.height)
      return iou > 0.2 && dist < minSide * 0.35
    })
    if (duplicate) continue
    kept.push(region)
  }
  return sortRegionsSpatially(kept)
}

function mergeAllSlotRegions(...lists) {
  return dedupeRegions(lists.flat())
}

/** Light green / white / gray placeholder windows common in collage JPG mockups. */
function findWhiteBlankRegions(imageData, width, height, maxRegions = MAX_REGIONS) {
  const isWhite = (x, y) => isWhitePlaceholderPixel(imageData, width, x, y)
  const isSolid = makeSolidBlankTester(imageData, width, height, isWhite, 2, 0.7)
  return findSlotRegions(imageData, width, height, isSolid, maxRegions, 0.12)
}

function findLightGrayBlankRegions(imageData, width, height, maxRegions = MAX_REGIONS) {
  const isGray = (x, y) => isLightGrayPlaceholderPixel(imageData, width, x, y)
  const isSolid = makeSolidBlankTester(imageData, width, height, isGray, 2, 0.68)
  return findSlotRegions(imageData, width, height, isSolid, maxRegions, 0.14)
}

function findLightGreenBlankRegions(imageData, width, height, maxRegions = MAX_REGIONS) {
  const isGreen = (x, y) => isLightGreenPlaceholderPixel(imageData, width, x, y)
  const isSolid = makeSolidBlankTester(imageData, width, height, isGreen, 2, 0.68)
  return findSlotRegions(imageData, width, height, isSolid, maxRegions, 0.16)
}

function findLightBlankRegions(imageData, width, height, maxRegions = MAX_REGIONS) {
  const isLightBlank = (x, y) => isBlankPlaceholderPixel(imageData, width, x, y)
  const isSolid = makeSolidBlankTester(imageData, width, height, isLightBlank, 2, 0.68)
  return findSlotRegions(imageData, width, height, isSolid, maxRegions, 0.12)
}

function bboxForSegment(region, imageData, width, height, isSlotPixel, axis, segStart, segEnd) {
  const x0 = axis === 'x' ? region.x + segStart : region.x
  const x1 = axis === 'x' ? region.x + segEnd - 1 : region.x + region.width - 1
  const y0 = axis === 'y' ? region.y + segStart : region.y
  const y1 = axis === 'y' ? region.y + segEnd - 1 : region.y + region.height - 1

  let minX = x1
  let minY = y1
  let maxX = x0
  let maxY = y0
  let count = 0

  for (let py = y0; py <= y1; py += 1) {
    for (let px = x0; px <= x1; px += 1) {
      if (!isSlotPixel(px, py)) continue
      count += 1
      minX = Math.min(minX, px)
      maxX = Math.max(maxX, px)
      minY = Math.min(minY, py)
      maxY = Math.max(maxY, py)
    }
  }

  if (!count) return null

  const bboxW = maxX - minX + 1
  const bboxH = maxY - minY + 1
  const bboxArea = bboxW * bboxH

  return {
    x: minX,
    y: minY,
    width: bboxW,
    height: bboxH,
    rotate: 0,
    borderRadius: 0,
    area: bboxArea,
    pixelCount: count,
    fillRatio: count / bboxArea,
  }
}

function splitByAxis(region, imageData, width, height, isSlotPixel, axis) {
  const size = axis === 'x' ? region.width : region.height
  if (size < 20) return [region]

  const counts = new Array(size).fill(0)
  for (let dy = 0; dy < region.height; dy += 1) {
    for (let dx = 0; dx < region.width; dx += 1) {
      const px = region.x + dx
      const py = region.y + dy
      if (!isSlotPixel(px, py)) continue
      counts[axis === 'x' ? dx : dy] += 1
    }
  }

  const maxCount = Math.max(...counts, 1)
  // More aggressive gaps so separate white windows split even with faint bridges
  const gapThreshold = Math.max(1, maxCount * 0.08)
  const minGap = Math.max(2, Math.round(size * 0.01))

  const segments = []
  let segStart = 0
  let gapStart = -1

  for (let i = 0; i <= size; i += 1) {
    const inGap = i < size ? counts[i] <= gapThreshold : true
    if (inGap && gapStart < 0) gapStart = i
    if (!inGap && gapStart >= 0) {
      if (i - gapStart >= minGap) {
        if (gapStart > segStart) segments.push([segStart, gapStart])
        segStart = i
      }
      gapStart = -1
    }
  }

  if (segStart < size) segments.push([segStart, size])
  if (segments.length <= 1) return [region]

  return segments
    .map(([start, end]) => bboxForSegment(region, imageData, width, height, isSlotPixel, axis, start, end))
    .filter(Boolean)
}

function splitMergedRegion(region, imageData, width, height, isSlotPixel) {
  if (region.fillRatio >= 0.88 && region.width < width * 0.6 && region.height < height * 0.6) {
    return [region]
  }

  const xParts = splitByAxis(region, imageData, width, height, isSlotPixel, 'x')
  const parts = xParts.length > 1
    ? xParts
    : splitByAxis(region, imageData, width, height, isSlotPixel, 'y')

  if (parts.length <= 1) return [region]

  return parts.flatMap((part) => {
    if (part.fillRatio >= 0.85 && part.width < width * 0.55) return [part]
    const yParts = splitByAxis(part, imageData, width, height, isSlotPixel, 'y')
    if (yParts.length > 1) return yParts
    const xAgain = splitByAxis(part, imageData, width, height, isSlotPixel, 'x')
    return xAgain.length > 1 ? xAgain : [part]
  })
}

function refineSlotRegions(regions, imageData, width, height, isSlotPixel) {
  const refined = []
  for (const region of regions) {
    if (region.fillRatio >= 0.88 && region.width < width * 0.55 && region.height < height * 0.55) {
      refined.push(region)
      continue
    }
    refined.push(...splitMergedRegion(region, imageData, width, height, isSlotPixel))
  }
  return dedupeRegions(refined, 0.4)
}

function filterAdminDetectedBoxes(boxes, canvasWidth, canvasHeight) {
  const valid = boxes.filter((box) => box && Number(box.width) > 0 && Number(box.height) > 0)
  if (!valid.length) return []

  const canvasArea = canvasWidth * canvasHeight
  const minSide = Math.max(16, Math.round(Math.min(canvasWidth, canvasHeight) * 0.028))
  const minArea = Math.max(640, canvasArea * 0.0018)

  const filtered = valid.filter(
    (box) =>
      Number(box.width) >= minSide &&
      Number(box.height) >= minSide &&
      Number(box.width) * Number(box.height) >= minArea,
  )

  return sortRegionsSpatially(filtered.length ? filtered : valid)
}

function enhanceOrganicClipPaths(boxes, imageData, width, height) {
  if (!imageData?.length) return boxes

  return boxes.map((box) => {
    if (box.clipPath) return box
    const fillRatio = Number(box.fillRatio)
    if (!Number.isFinite(fillRatio)) return box
    if (isHexLikeFillRatio(fillRatio)) return box
    if (fillRatio >= 0.9) return box

    const clipPath = inferSlotClipPathFromPixels(imageData, width, height, box)
    return clipPath ? { ...box, borderRadius: 0, clipPath } : box
  })
}

function sortRegionsSpatially(regions) {
  return [...regions].sort((a, b) => {
    const rowA = Math.floor(a.y / Math.max(a.height, 1))
    const rowB = Math.floor(b.y / Math.max(b.height, 1))
    if (Math.abs(rowA - rowB) > 2) return a.y - b.y
    return a.x - b.x
  })
}

function regionToBox(region) {
  const { area, pixelCount, fillRatio, clipPath, _padded, ...box } = region
  const isHex = isHexLikeFillRatio(fillRatio)
  const pad = _padded ? 0 : isHex ? 6 : 2

  const raw = {
    x: Number(box.x) + pad,
    y: Number(box.y) + pad,
    width: Math.max(8, Number(box.width) - pad * 2),
    height: Math.max(8, Number(box.height) - pad * 2),
    rotate: box.rotate || 0,
    borderRadius: Number(box.borderRadius) || 0,
    fillRatio,
  }

  if (clipPath) {
    const { fillRatio: _f, ...out } = raw
    return { ...out, borderRadius: 0, clipPath }
  }

  if (isHex) {
    return applyHexSlotClip(raw, 0.03)
  }

  return normalizeRectPhotoSlot(raw)
}

function findSlotRegions(imageData, width, height, isSlotPixel, maxRegions = MAX_REGIONS, minFillRatio = MIN_FILL_RATIO) {
  const visited = new Uint8Array(width * height)
  const regions = []
  const canvasArea = width * height
  const minRegionPixels = Math.max(250, Math.round(canvasArea * MIN_REGION_PIXEL_RATIO))

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (visited[idx] || !isSlotPixel(x, y)) continue

      let minX = x
      let maxX = x
      let minY = y
      let maxY = y
      let count = 0
      const stack = [[x, y]]

      while (stack.length) {
        const [cx, cy] = stack.pop()
        const cidx = cy * width + cx
        if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue
        if (visited[cidx] || !isSlotPixel(cx, cy)) continue
        visited[cidx] = 1
        count++
        minX = Math.min(minX, cx)
        maxX = Math.max(maxX, cx)
        minY = Math.min(minY, cy)
        maxY = Math.max(maxY, cy)
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
      }

      const bboxW = maxX - minX + 1
      const bboxH = maxY - minY + 1
      const bboxArea = bboxW * bboxH
      const fillRatio = count / bboxArea

      if (count < minRegionPixels) continue
      if (bboxArea / canvasArea < MIN_BBOX_RATIO) continue
      if (fillRatio < minFillRatio) continue
      if (bboxArea / canvasArea > 0.82) continue

      regions.push({
        x: minX,
        y: minY,
        width: bboxW,
        height: bboxH,
        rotate: 0,
        borderRadius: 0,
        area: bboxArea,
        pixelCount: count,
        fillRatio,
      })
    }
  }

  return sortRegionsSpatially(
    regions.sort((a, b) => b.area - a.area).slice(0, maxRegions),
  )
}

function findTransparentRegions(imageData, width, height, maxRegions = MAX_REGIONS) {
  const isTransparent = (x, y) => {
    const i = (y * width + x) * 4
    return imageData[i + 3] < ALPHA_THRESHOLD
  }
  return findSlotRegions(imageData, width, height, isTransparent, maxRegions)
}

/** Black/dark placeholder boxes in collage JPG/PNG (non-transparent). */
function findDarkSlotRegions(imageData, width, height, maxRegions = MAX_REGIONS) {
  const isDarkSlot = (x, y) => {
    const i = (y * width + x) * 4
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]
    const a = imageData[i + 3]
    if (a < ALPHA_THRESHOLD) return false
    return r < 60 && g < 60 && b < 60
  }
  return findSlotRegions(imageData, width, height, isDarkSlot, maxRegions, 0.55)
}

function pickBestSlotRegions(transparentRegions, darkRegions, lightRegions = [], imageData, width, height) {
  if (!imageData?.length) {
    const merged = mergeAllSlotRegions(transparentRegions, darkRegions, lightRegions)
    if (merged.length) return merged
    return lightRegions.length ? lightRegions : darkRegions.length ? darkRegions : transparentRegions
  }

  const isTransparent = (x, y) => {
    const i = (y * width + x) * 4
    return imageData[i + 3] < ALPHA_THRESHOLD
  }
  const isWhite = (x, y) => isWhitePlaceholderPixel(imageData, width, x, y)
  const isGray = (x, y) => isLightGrayPlaceholderPixel(imageData, width, x, y)
  const isGreen = (x, y) => isLightGreenPlaceholderPixel(imageData, width, x, y)
  const isBlank = (x, y) => isBlankPlaceholderPixel(imageData, width, x, y)
  const solidWhite = makeSolidBlankTester(imageData, width, height, isWhite, 2, 0.7)
  const solidGray = makeSolidBlankTester(imageData, width, height, isGray, 2, 0.68)
  const solidGreen = makeSolidBlankTester(imageData, width, height, isGreen, 2, 0.68)
  const solidBlank = makeSolidBlankTester(imageData, width, height, isBlank, 2, 0.68)

  // PNG frames: real cut-out holes win over flat color heuristics.
  const refinedTransparent = refineSlotRegions(transparentRegions, imageData, width, height, isTransparent)
  if (refinedTransparent.length >= 2) {
    return dedupeRegions(refinedTransparent, 0.4)
  }

  // Solid blank windows (ignores thin white handwriting on dark collage frames).
  let primary = refineSlotRegions(findLightBlankRegions(imageData, width, height), imageData, width, height, solidBlank)

  if (primary.length < 2) {
    const grayOnly = refineSlotRegions(findLightGrayBlankRegions(imageData, width, height), imageData, width, height, solidGray)
    const whiteOnly = refineSlotRegions(findWhiteBlankRegions(imageData, width, height), imageData, width, height, solidWhite)
    const greenOnly = refineSlotRegions(findLightGreenBlankRegions(imageData, width, height), imageData, width, height, solidGreen)
    primary = mergeAllSlotRegions(primary, grayOnly, whiteOnly, greenOnly, refinedTransparent)
  }

  if (primary.length >= 2) {
    return dedupeRegions(primary, 0.4)
  }

  // Even a single solid blank is better than falling back to a default inset.
  if (primary.length === 1) {
    const extras = mergeAllSlotRegions(primary, refinedTransparent, darkRegions)
    if (extras.length >= 2) return dedupeRegions(extras, 0.4)
    return primary
  }

  const refinedLight = refineSlotRegions(lightRegions, imageData, width, height, solidBlank)
  const merged = mergeAllSlotRegions(primary, refinedLight, refinedTransparent, darkRegions)
  if (merged.length) return dedupeRegions(merged, 0.4)
  if (refinedTransparent.length) return refinedTransparent
  if (darkRegions.length) return darkRegions
  return lightRegions
}

function buildResultFromRegions(regions, canvasWidth, canvasHeight, options = {}) {
  const { forAdmin = false } = options
  const sorted = sortRegionsSpatially(regions)
  let boxes = sorted.map(regionToBox)

  boxes = forAdmin
    ? filterAdminDetectedBoxes(boxes, canvasWidth, canvasHeight)
    : filterSignificantPhotoBoxes(boxes)

  if (!boxes.length) {
    const fallback = defaultInsetBox(canvasWidth, canvasHeight)
    return {
      canvasWidth,
      canvasHeight,
      photoBox: fallback,
      photoBoxes: [],
      multiSlot: false,
      slotCount: 1,
    }
  }

  if (boxes.length === 1) {
    return {
      canvasWidth,
      canvasHeight,
      photoBox: boxes[0],
      photoBoxes: [],
      multiSlot: false,
      slotCount: 1,
    }
  }

  return {
    canvasWidth,
    canvasHeight,
    photoBox: boxes[0],
    photoBoxes: boxes,
    multiSlot: true,
    slotCount: boxes.length,
  }
}

function drawImageToCanvas(img, options = {}) {
  const { forAdmin = false } = options
  let canvasWidth = img.naturalWidth || img.width
  let canvasHeight = img.naturalHeight || img.height

  if (!canvasWidth || !canvasHeight) {
    canvasWidth = 1000
    canvasHeight = 1000
  }

  const scale = Math.min(1, MAX_ANALYZE_DIMENSION / Math.max(canvasWidth, canvasHeight))
  const drawW = Math.round(canvasWidth * scale)
  const drawH = Math.round(canvasHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = drawW
  canvas.height = drawH
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.clearRect(0, 0, drawW, drawH)
  ctx.drawImage(img, 0, 0, drawW, drawH)
  const { data } = ctx.getImageData(0, 0, drawW, drawH)

  const transparentRegions = findTransparentRegions(data, drawW, drawH)
  const darkRegions = findDarkSlotRegions(data, drawW, drawH)
  const lightRegions = findLightBlankRegions(data, drawW, drawH)
  const regions = pickBestSlotRegions(transparentRegions, darkRegions, lightRegions, data, drawW, drawH)

  const scaleBack = (box) => ({
    ...box,
    x: Math.round(box.x / scale),
    y: Math.round(box.y / scale),
    width: Math.round(box.width / scale),
    height: Math.round(box.height / scale),
  })

  let boxesAtScale = regions.map(regionToBox)
  boxesAtScale = enhanceOrganicClipPaths(boxesAtScale, data, drawW, drawH)

  const scaledRegions = regions.map((region, index) => ({
    ...region,
    ...scaleBack(boxesAtScale[index] || region),
    clipPath: boxesAtScale[index]?.clipPath,
    fillRatio: boxesAtScale[index]?.fillRatio ?? region.fillRatio,
    _padded: true,
  }))

  return buildResultFromRegions(scaledRegions, canvasWidth, canvasHeight, { forAdmin })
}

function parseSvgDimensions(svgText) {
  const viewBoxMatch = svgText.match(/viewBox=["']([^"']+)["']/i)
  const widthMatch = svgText.match(/\bwidth=["']([\d.]+)/i)
  const heightMatch = svgText.match(/\bheight=["']([\d.]+)/i)

  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number)
    if (parts.length === 4) {
      return {
        width: Math.round(parts[2]) || 1000,
        height: Math.round(parts[3]) || 1000,
      }
    }
  }

  return {
    width: Math.round(Number(widthMatch?.[1]) || 1000),
    height: Math.round(Number(heightMatch?.[1]) || 1000),
  }
}

function parseSvgTransparentPolygons(svgText, canvasWidth, canvasHeight) {
  const boxes = []
  const polygonRe = /<polygon[^>]*\spoints=["']([^"']+)["'][^>]*>/gi
  let match

  while ((match = polygonRe.exec(svgText))) {
    const fullTag = match[0]
    const isHole =
      /class="[^"]*(?:fil2|fil3|hole|window|slot)[^"]*"/i.test(fullTag) ||
      /fill:\s*none/i.test(fullTag) ||
      /fill="none"/i.test(fullTag)

    if (!isHole) continue

    const slot = clipPathFromPolygonPoints(match[1], canvasWidth, canvasHeight)
    if (slot) boxes.push({ ...slot, area: slot.width * slot.height })
  }

  return boxes.length ? sortRegionsSpatially(boxes) : null
}

function parseSvgPhotoElements(svgText, canvasWidth, canvasHeight) {
  const transparentPolygons = parseSvgTransparentPolygons(svgText, canvasWidth, canvasHeight)
  if (transparentPolygons?.length) return transparentPolygons

  const boxes = []
  const idPattern = /id=["'](photo(?:-window|box|slot)?|slot\d*)["'][^>]*>/gi
  let match
  while ((match = idPattern.exec(svgText))) {
    const tag = match[0]
    const x = Number(tag.match(/\bx=["']([\d.]+)/i)?.[1] || 0)
    const y = Number(tag.match(/\by=["']([\d.]+)/i)?.[1] || 0)
    const w = Number(tag.match(/\bwidth=["']([\d.]+)/i)?.[1] || 0)
    const h = Number(tag.match(/\bheight=["']([\d.]+)/i)?.[1] || 0)
    if (w > 0 && h > 0) {
      boxes.push({ x, y, width: w, height: h, rotate: 0, borderRadius: 0, area: w * h })
    }
  }

  if (boxes.length) return sortRegionsSpatially(boxes)
  return null
}

export async function analyzeImageElement(img, options = {}) {
  return drawImageToCanvas(img, options)
}

export async function analyzeRasterMockup(file, options = {}) {
  const img = await loadImageFromFile(file)
  return analyzeImageElement(img, options)
}

export async function analyzeSvgMockup(file, options = {}) {
  const { forAdmin = false } = options
  const svgText = await readFileAsText(file)
  const { width, height } = parseSvgDimensions(svgText)

  const taggedBoxes = parseSvgPhotoElements(svgText, width, height)
  if (taggedBoxes?.length) {
    return buildResultFromRegions(taggedBoxes, width, height, { forAdmin })
  }

  try {
    const img = await loadSvgAsImage(svgText)
    const raster = await analyzeImageElement(img, { forAdmin })
    if (raster.slotCount > 0) return raster
  } catch {
    /* fall through */
  }

  return {
    canvasWidth: width,
    canvasHeight: height,
    photoBox: defaultInsetBox(width, height),
    photoBoxes: [],
    multiSlot: false,
    slotCount: 1,
  }
}

/** Analyze PNG/SVG mockup and auto-build canvas + photo window(s). */
export async function analyzeMockupFile(file, options = {}) {
  if (!file) throw new Error('No file selected')

  const isSvg =
    file.type === 'image/svg+xml' ||
    file.name?.toLowerCase().endsWith('.svg')

  if (isSvg) return analyzeSvgMockup(file, options)
  return analyzeRasterMockup(file, options)
}

/** Re-analyze an uploaded mockup URL (PNG/SVG/WebP). */
export async function analyzeMockupFromUrl(url, options = {}) {
  if (!url) throw new Error('No mockup URL')

  const isSvg = url.toLowerCase().includes('.svg')
  if (isSvg) {
    const res = await fetch(url)
    const svgText = await res.text()
    const blob = new File([svgText], 'mockup.svg', { type: 'image/svg+xml' })
    return analyzeSvgMockup(blob, options)
  }

  const img = await loadImageFromUrl(url)
  return analyzeImageElement(img, options)
}

export { defaultInsetBox, parseSvgDimensions }
