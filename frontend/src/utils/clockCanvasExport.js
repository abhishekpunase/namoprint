const CLOCK_NUMBERS = [
  ['12', 50, 9],
  ['1', 68, 14],
  ['2', 82, 28],
  ['3', 88, 50],
  ['4', 82, 72],
  ['5', 68, 86],
  ['6', 50, 91],
  ['7', 32, 86],
  ['8', 18, 72],
  ['9', 12, 50],
  ['10', 18, 28],
  ['11', 32, 14],
]

const COLOR_MAP = {
  white: '#ffffff',
  black: '#111827',
  gold: '#eab308',
  red: '#ef4444',
  blue: '#2563eb',
  green: '#22c55e',
  orange: '#f97316',
  silver: '#cbd5e1',
}

function resolveNumberColor(value) {
  if (!value) return '#ffffff'
  if (String(value).startsWith('#')) return value
  return COLOR_MAP[String(value).toLowerCase()] || '#ffffff'
}

function toRoman(num) {
  const romans = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
  const ints = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
  let n = Number(num)
  let res = ''
  for (let i = 0; i < ints.length; i += 1) {
    while (n >= ints[i]) {
      res += romans[i]
      n -= ints[i]
    }
  }
  return res
}

function renderClockLabel(number, dialStyle, numberStyle) {
  if (dialStyle === 'Minimal Marks') return '|'
  if (numberStyle === 'Roman') return toRoman(number)
  if (numberStyle === 'Dots') return '•'
  return String(number)
}

function getNumberFont(numberStyle, fontSize) {
  switch (numberStyle) {
    case 'Script':
      return `400 ${fontSize}px "Pacifico", cursive`
    case 'Retro':
      return `400 ${fontSize}px "Bangers", monospace`
    case 'Bold':
      return `900 ${fontSize}px "Anton", Arial, sans-serif`
    case 'Roman':
      return `700 ${fontSize}px "Cinzel", Georgia, serif`
    case 'Outline':
      return `700 ${fontSize}px Poppins, Arial, sans-serif`
    default:
      return `700 ${fontSize}px Poppins, Arial, sans-serif`
  }
}

function getHandFill(hands = 'Classic Silver') {
  const key = String(hands).toLowerCase()
  if (key.includes('gold')) return '#b45309'
  if (key.includes('black') || key.includes('bold')) return '#111827'
  return '#9ca3af'
}

function drawHand(ctx, cx, cy, length, angleDeg, color, width) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((angleDeg * Math.PI) / 180)
  ctx.fillStyle = color
  ctx.fillRect(-width / 2, -length, width, length)
  ctx.restore()
}

/** Match PreviewFrame.shouldShowClockDial */
export function shouldShowClockDial(product, options = {}, variant, slotLayout) {
  const isClockProduct =
    product?.productType === 'custom-wall-watch' || product?.productType === 'photo-clock'
  if (!isClockProduct) return false

  const shape = String(options?.shape || product?.defaultOptions?.shape || variant?.frameType || '')
  const frameType = String(variant?.frameType || '').toLowerCase()
  const collageCount = Number(
    options?.collagePhotoCount || product?.defaultOptions?.collagePhotoCount || 0,
  )

  if (options?.collageEnabled || product?.defaultOptions?.collageEnabled) return false
  if (collageCount > 1) return false
  if (product?.mockup?.photoBoxes?.length > 1) return false
  if (/four photo|collage/i.test(shape)) return false
  if (frameType === 'collage') return false
  if (options?.layout === 'Collage') return false
  if (slotLayout === 'clock-collage' || slotLayout === 'frame-collage') return false

  return true
}

export function drawCssClockFrame(ctx, canvas, { frameColor = '#111111', thicknessPx = 12 } = {}) {
  const w = Math.max(1, Number(canvas.width) || 1000)
  const h = Math.max(1, Number(canvas.height) || 1000)
  const border = Math.max(4, Number(thicknessPx) || 12)

  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = frameColor
  ctx.lineWidth = border
  ctx.strokeRect(border / 2, border / 2, w - border, h - border)
}

/** Draw clock numbers + hands on a photo box region (canvas pixel coords). */
export function drawClockFace(ctx, box, options = {}) {
  if (!box?.width || !box?.height) return

  const dialStyle = options.dialStyle || 'Modern Numbers'
  const numberStyle = options.numberStyle || 'Modern'
  const hands = options.clockHands || 'Classic Silver'
  const numberColor = resolveNumberColor(options.numberColor)
  const fontSize = Math.max(14, box.width * 0.05)
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  const handColor = getHandFill(hands)

  if (dialStyle !== 'No Numbers') {
    CLOCK_NUMBERS.forEach(([number, leftPct, topPct]) => {
      const x = box.x + (leftPct / 100) * box.width
      const y = box.y + (topPct / 100) * box.height
      const label = renderClockLabel(number, dialStyle, numberStyle)

      ctx.save()
      ctx.font = getNumberFont(numberStyle, fontSize)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (numberStyle === 'Outline') {
        ctx.strokeStyle = numberColor
        ctx.lineWidth = Math.max(1.5, fontSize * 0.1)
        ctx.strokeText(label, x, y)
      } else {
        ctx.fillStyle = numberColor
        ctx.shadowColor = 'rgba(0,0,0,0.85)'
        ctx.shadowBlur = Math.max(2, fontSize * 0.2)
        ctx.fillText(label, x, y)
      }
      ctx.restore()
    })
  }

  drawHand(ctx, cx, cy, box.height * 0.22, 30, handColor, Math.max(3, box.width * 0.004))
  drawHand(ctx, cx, cy, box.height * 0.3, 120, handColor, Math.max(2.5, box.width * 0.003))
  drawHand(ctx, cx, cy, box.height * 0.34, 250, '#ef4444', Math.max(2, box.width * 0.0025))

  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(4, box.width * 0.012), 0, Math.PI * 2)
  ctx.fillStyle = '#374151'
  ctx.fill()
}
