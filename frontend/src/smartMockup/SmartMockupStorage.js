import { SMART_MOCKUP_VERSION } from './constants'

const sessionKey = (productId, userId = 'guest') => `omgs_smart_mockup_${userId}_${productId}`

export function loadEditorSession(productId, userId) {
  try {
    const raw = localStorage.getItem(sessionKey(productId, userId))
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.version !== SMART_MOCKUP_VERSION) return null
    return data
  } catch {
    return null
  }
}

export function saveEditorSession(productId, userId, payload) {
  try {
    localStorage.setItem(
      sessionKey(productId, userId),
      JSON.stringify({ ...payload, version: SMART_MOCKUP_VERSION, savedAt: Date.now() }),
    )
  } catch {
    /* quota */
  }
}

export function clearEditorSession(productId, userId) {
  localStorage.removeItem(sessionKey(productId, userId))
}

/** Build cart customization payload (stored in existing Mixed customization field) */
export function buildCartSmartMockupPayload(editorState, exports = {}) {
  return {
    smartMockup: {
      version: SMART_MOCKUP_VERSION,
      slots: editorState.slots,
      layerVisibility: editorState.layerVisibility,
      canvas: editorState.canvas,
      previews: exports,
    },
  }
}

/** Extract smart mockup config from product (uses existing defaultOptions + mockup fields) */
export function extractSmartMockupFromProduct(product) {
  const embedded = product?.defaultOptions?.smartMockup
  const mockup = product?.mockup || {}
  return {
    version: embedded?.version || SMART_MOCKUP_VERSION,
    canvas: mockup.canvas || embedded?.canvas || { width: 1000, height: 1000 },
    frameUrl: mockup.frameImage || embedded?.frameUrl || product?.images?.[0] || '',
    maskUrl: mockup.overlayImageUrl || embedded?.maskUrl || '',
    overlayUrl: embedded?.overlayUrl || '',
    previewUrl: mockup.baseImageUrl || embedded?.previewUrl || '',
    slots: embedded?.slots || [],
    photoBoxes: mockup.photoBoxes?.length ? mockup.photoBoxes : mockup.photoBox ? [mockup.photoBox] : [],
    safeArea: embedded?.safeArea,
    printArea: embedded?.printArea,
    layerVisibility: embedded?.layerVisibility,
  }
}
