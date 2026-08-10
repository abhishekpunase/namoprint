/** Shared clip paths + frame rules for wall clock shapes */

export const HEART_CLIP_PATH =
  'polygon(50% 90%, 10% 45%, 10% 25%, 25% 10%, 50% 30%, 75% 10%, 90% 25%, 90% 45%)'

export const TRIANGLE_CLIP_PATH = 'polygon(50% 0%, 0% 100%, 100% 100%)'

export const HEXAGON_CLIP_PATH =
  'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)'

export const OCTAGON_CLIP_PATH =
  'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'

export const PENTAGON_CLIP_PATH =
  'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'

export const DIAMOND_CLIP_PATH = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'

export const STAR_CLIP_PATH =
  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'

/** Shapes that use the generic square SVG mockup frame */
export const WALL_CLOCK_SVG_FRAME_SHAPES = new Set(['Circle', 'Square', 'Square Round'])

export function isGenericSquareFrameUrl(url = '') {
  return /frame-square\.svg/i.test(String(url))
}

export function wallWatchShouldUseSvgFrame(product, options = {}, variant = {}, frameImage = '') {
  if (!frameImage) return false
  const productType = product?.productType || ''
  if (productType !== 'custom-wall-watch' && productType !== 'photo-clock') return true

  const shape = options?.shape || product?.defaultOptions?.shape || variant?.frameType || 'Circle'
  const savedFrame = product?.mockup?.frameImage || ''

  if (savedFrame && !isGenericSquareFrameUrl(savedFrame)) return true
  if (isGenericSquareFrameUrl(frameImage) && !WALL_CLOCK_SVG_FRAME_SHAPES.has(shape)) return false

  return true
}

export function isShapedWallClockShape(shape = '') {
  return Boolean(shape) && !WALL_CLOCK_SVG_FRAME_SHAPES.has(shape)
}
