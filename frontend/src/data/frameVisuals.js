const mockupImages = {
  portrait: '/mockups/frame-portrait.svg',
  square: '/mockups/frame-square.svg',
  aluminium: '/mockups/frame-aluminium.svg',
  collage: '/mockups/frame-collage.svg',
}
export const THICKNESS_MAP = {
  '3mm': { label: '3mm', px: 6 },
  '4mm': { label: '4mm', px: 8 },
  '5mm': { label: '5mm', px: 12 },
  '8mm': { label: '8mm', px: 20 },
}

const FRAME_TYPE_OVERLAY = {
  'no frame': null,
  none: null,
  sheet: null,
  'dual border': mockupImages.portrait,
  floating: mockupImages.aluminium,
  collage: mockupImages.collage,
  round: mockupImages.square,
  circle: mockupImages.square,
  square: mockupImages.square,
  heart: null,
  leaf: null,
  classic: mockupImages.portrait,
  carved: mockupImages.portrait,
  rustic: mockupImages.portrait,
  modern: mockupImages.aluminium,
  backlit: mockupImages.portrait,
  'stand base': mockupImages.portrait,
  layered: mockupImages.aluminium,
  temple: mockupImages.portrait,
  devotional: mockupImages.portrait,
  'gallery wrap': mockupImages.portrait,
  'hardbound': mockupImages.portrait,
  'die cut': mockupImages.aluminium,
  roll: mockupImages.aluminium,
}

const FINISH_STYLES = {
  glossy: {
    key: 'glossy',
    shadow: '0 8px 28px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.4)',
    shine: 'linear-gradient(135deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 35%, transparent 55%)',
    edgeOpacity: 0.88,
  },
  matte: {
    key: 'matte',
    shadow: '0 4px 16px rgba(0,0,0,0.1)',
    shine: 'none',
    edgeOpacity: 0.95,
  },
  crystal: {
    key: 'crystal',
    shadow: '0 6px 24px rgba(0,0,0,0.12), 0 0 20px rgba(255,255,255,0.15)',
    shine: 'linear-gradient(145deg, rgba(255,255,255,0.55) 0%, transparent 40%, rgba(255,255,255,0.2) 70%, transparent 100%)',
    edgeOpacity: 0.72,
  },
}

const FINISH_ALIASES = {
  'glossy varnish': 'glossy',
  'crystal clear': 'crystal',
  holographic: 'glossy',
  'gold accent': 'glossy',
  'black accent': 'matte',
  'frosted acrylic': 'matte',
  'gold finish': 'glossy',
  'silver finish': 'glossy',
  'natural wood': 'matte',
}

export function normalizeFinish(finish = '') {
  const lower = finish.toLowerCase().trim()
  if (FINISH_ALIASES[lower]) return FINISH_ALIASES[lower]
  if (lower.includes('gloss')) return 'glossy'
  if (lower.includes('matte') || lower.includes('mat')) return 'matte'
  if (lower.includes('crystal') || lower.includes('clear')) return 'crystal'
  return 'glossy'
}

export function getFinishStyle(finish) {
  const key = normalizeFinish(finish)
  return FINISH_STYLES[key] || FINISH_STYLES.glossy
}

export function parseMaterialThickness(material = '', optionsMaterial = '') {
  const source = `${material} ${optionsMaterial}`.toLowerCase()
  const match = source.match(/(\d+)\s*mm/)
  if (match) {
    const label = `${match[1]}mm`
    return THICKNESS_MAP[label] || { label, px: Math.min(Number(match[1]) * 2.5, 24) }
  }
  return THICKNESS_MAP['5mm']
}

export function resolveFrameOverlay(product, variant, options = {}) {
  const productType = product?.productType || ''
  if (productType === 'acrylic-name-plate' || productType === 'acrylic-monogram-nameplate') {
    return product?.mockup?.frameImage || null
  }

  const frameType = (variant?.frameType || options.frameStyle || '').toLowerCase().trim()

  if (frameType === 'no frame' || frameType === 'none') return null

  // Admin-uploaded mockup always wins when present
  if (product?.mockup?.frameImage) return product.mockup.frameImage

  if (frameType && FRAME_TYPE_OVERLAY[frameType] !== undefined) {
    return FRAME_TYPE_OVERLAY[frameType]
  }

  if (frameType.includes('collage')) return mockupImages.collage
  if (frameType.includes('float')) return mockupImages.aluminium
  if (frameType.includes('dual') || frameType.includes('border')) return mockupImages.portrait
  if (frameType.includes('round') || frameType.includes('circle') || frameType.includes('square')) {
    return mockupImages.square
  }

  if (options.layout === 'Collage') return mockupImages.collage

  return undefined
}

export function getFrameStyleHint(frameStyle = '') {
  const lower = frameStyle.toLowerCase()
  if (lower.includes('float')) return 'floating'
  if (lower.includes('wall')) return 'wall'
  if (lower.includes('table') || lower.includes('stand')) return 'stand'
  if (lower.includes('magnetic')) return 'magnetic'
  return 'default'
}

export function hexToRgba(hex, alpha = 1) {
  if (!hex || !hex.startsWith('#')) return `rgba(216, 218, 222, ${alpha})`
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
