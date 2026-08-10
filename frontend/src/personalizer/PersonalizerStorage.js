import { PERSONALIZER_VERSION } from './constants'

const sessionKey = (productId, userId = 'guest') => `omgs_personalizer_${userId}_${productId}`

export function loadPersonalizerSession(productId, userId) {
  try {
    const raw = localStorage.getItem(sessionKey(productId, userId))
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.version !== PERSONALIZER_VERSION) return null
    return data
  } catch {
    return null
  }
}

export function savePersonalizerSession(productId, userId, payload) {
  try {
    localStorage.setItem(
      sessionKey(productId, userId),
      JSON.stringify({ ...payload, version: PERSONALIZER_VERSION, savedAt: Date.now() }),
    )
  } catch {
    /* quota */
  }
}

export function clearPersonalizerSession(productId, userId) {
  localStorage.removeItem(sessionKey(productId, userId))
}

/** Cart customization payload — uses existing Mixed customization field */
export function buildCartPersonalizerPayload(state, exports = {}) {
  return {
    personalizer: {
      version: PERSONALIZER_VERSION,
      slots: state.slots,
      textLayers: state.textLayers,
      clipartLayers: state.clipartLayers,
      background: state.background,
      layerState: state.layerState,
      layerVisibility: state.layerVisibility,
      canvas: state.canvas,
      activeSlotIndex: state.activeSlotIndex,
      zoom: state.zoom,
      previews: exports,
    },
  }
}
