export { LAYER_IDS, DEFAULT_SLOT_TRANSFORM, DEFAULT_LAYER_VISIBILITY, MAX_SMART_SLOTS } from '../smartMockup/constants'

export const PERSONALIZER_VERSION = 1

export const LAYER_META = [
  { id: 'background', label: 'Background', icon: 'bg' },
  { id: 'customerImage', label: 'Customer Image', icon: 'photo' },
  { id: 'mask', label: 'Mask', icon: 'mask' },
  { id: 'overlay', label: 'Overlay', icon: 'overlay' },
  { id: 'frame', label: 'Frame', icon: 'frame' },
  { id: 'reflection', label: 'Reflection', icon: 'reflection' },
  { id: 'shadow', label: 'Shadow', icon: 'shadow' },
  { id: 'text', label: 'Text', icon: 'text' },
  { id: 'logo', label: 'Logo / Clipart', icon: 'logo' },
]

export const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Playfair Display',
  'Pacifico',
  'Bebas Neue',
  'Dancing Script',
  'Lora',
  'Oswald',
]

export const DEFAULT_TEXT_LAYER = () => ({
  id: `text-${Date.now()}`,
  type: 'text',
  text: 'Your Text',
  x: 500,
  y: 500,
  fontSize: 48,
  fontFamily: 'Inter',
  fill: '#111827',
  fontStyle: 'normal',
  fontWeight: '600',
  letterSpacing: 0,
  lineHeight: 1.2,
  rotation: 0,
  opacity: 1,
  stroke: '',
  strokeWidth: 0,
  shadowColor: 'rgba(0,0,0,0.25)',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  underline: false,
  locked: false,
  visible: true,
})

export const DEFAULT_CLIPART_LAYER = () => ({
  id: `clip-${Date.now()}`,
  type: 'clipart',
  src: '',
  x: 400,
  y: 400,
  width: 120,
  height: 120,
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
})

export const DEFAULT_BACKGROUND = () => ({
  type: 'gradient',
  color: '#f3f4f6',
  color2: '#e5e7eb',
  imageUrl: '',
})

export const DEFAULT_LAYER_STATE = () => ({
  background: { visible: true, locked: true, opacity: 1 },
  customerImage: { visible: true, locked: false, opacity: 1 },
  mask: { visible: true, locked: true, opacity: 1 },
  overlay: { visible: true, locked: true, opacity: 1 },
  frame: { visible: true, locked: true, opacity: 1 },
  reflection: { visible: false, locked: true, opacity: 0.12 },
  shadow: { visible: true, locked: true, opacity: 0.08 },
  text: { visible: true, locked: false, opacity: 1 },
  logo: { visible: true, locked: false, opacity: 1 },
})
