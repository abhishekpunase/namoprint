export const SMART_MOCKUP_VERSION = 1

export const LAYER_IDS = {
  BACKGROUND: 'background',
  CUSTOMER_IMAGE: 'customerImage',
  MASK: 'mask',
  OVERLAY: 'overlay',
  REFLECTION: 'reflection',
  SHADOW: 'shadow',
  FRAME: 'frame',
  TEXT: 'text',
}

export const DEFAULT_SLOT_TRANSFORM = () => ({
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  flipX: false,
  flipY: false,
})

export const DEFAULT_LAYER_VISIBILITY = {
  [LAYER_IDS.BACKGROUND]: true,
  [LAYER_IDS.CUSTOMER_IMAGE]: true,
  [LAYER_IDS.MASK]: true,
  [LAYER_IDS.OVERLAY]: true,
  [LAYER_IDS.REFLECTION]: false,
  [LAYER_IDS.SHADOW]: true,
  [LAYER_IDS.FRAME]: true,
  [LAYER_IDS.TEXT]: true,
}

export const EXPORT_FORMATS = ['png', 'webp', 'jpeg']

export const MAX_SMART_SLOTS = 24
