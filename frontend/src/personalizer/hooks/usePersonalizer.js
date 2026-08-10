import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_BACKGROUND,
  DEFAULT_CLIPART_LAYER,
  DEFAULT_LAYER_STATE,
  DEFAULT_SLOT_TRANSFORM,
  DEFAULT_TEXT_LAYER,
  LAYER_IDS,
} from '../constants'
import { extractPersonalizerFromProduct, generatePersonalizerFromUrl } from '../PersonalizerEngine'
import { exportPersonalizerVariants, renderPersonalizer } from '../PersonalizerCompositor'
import { loadPersonalizerSession, savePersonalizerSession } from '../PersonalizerStorage'
import {
  createHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo,
} from '../../smartMockup/SmartMockupHistory'
import { DEFAULT_LAYER_VISIBILITY } from '../../smartMockup/constants'

function mergeLayerVisibility(layerState) {
  const vis = { ...DEFAULT_LAYER_VISIBILITY }
  if (layerState) {
    for (const [key, val] of Object.entries(layerState)) {
      if (val && typeof val.visible === 'boolean') vis[key] = val.visible
    }
  }
  return vis
}

function buildInitialState(product, session) {
  const config = extractPersonalizerFromProduct(product)
  const layerState = session?.layerState || config.layerState || DEFAULT_LAYER_STATE()

  return {
    canvas: session?.canvas || config.canvas,
    frameUrl: config.frameUrl,
    overlayUrl: config.overlayUrl || '',
    maskUrl: config.maskUrl || '',
    slots: session?.slots || config.slots || [],
    textLayers: session?.textLayers || config.textLayers || [],
    clipartLayers: session?.clipartLayers || config.clipartLayers || [],
    background: session?.background || config.background || DEFAULT_BACKGROUND(),
    layerState,
    layerVisibility: mergeLayerVisibility(layerState),
    activeSlotIndex: session?.activeSlotIndex ?? 0,
    activeTextId: session?.activeTextId || null,
    zoom: session?.zoom ?? 1,
    theme: session?.theme || 'light',
  }
}

export function usePersonalizer({ product, userId = 'guest', mode = 'customer' }) {
  const productId = product?._id || product?.slug
  const [ready, setReady] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [toast, setToast] = useState('')
  const historyRef = useRef(createHistory(buildInitialState(product, null)))
  const [, tick] = useState(0)
  const forceUpdate = () => tick((n) => n + 1)

  const state = historyRef.current.present

  useEffect(() => {
    let cancelled = false
    async function init() {
      setReady(false)
      const session = productId ? loadPersonalizerSession(productId, userId) : null
      let initial = buildInitialState(product, session)

      if (initial.frameUrl && (!initial.maskUrl || !initial.overlayUrl)) {
        try {
          const generated = await generatePersonalizerFromUrl(initial.frameUrl)
          initial = {
            ...initial,
            maskUrl: generated.maskUrl,
            overlayUrl: generated.overlayUrl,
            previewUrl: generated.previewUrl,
            slots: generated.slots.map((s, i) => ({
              ...s,
              ...(session?.slots?.[i] || {}),
            })),
            printArea: generated.printArea,
            safeArea: generated.safeArea,
          }
        } catch {
          /* use basic */
        }
      }

      if (!cancelled) {
        historyRef.current = createHistory(initial)
        forceUpdate()
        setReady(true)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [productId, product?.mockup?.frameImage])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }, [])

  const commit = useCallback((next) => {
    historyRef.current = pushHistory(historyRef.current, next)
    forceUpdate()
  }, [])

  const undo = useCallback(() => {
    historyRef.current = undoHistory(historyRef.current)
    forceUpdate()
  }, [])

  const redo = useCallback(() => {
    historyRef.current = redoHistory(historyRef.current)
    forceUpdate()
  }, [])

  const persistSession = useCallback(() => {
    if (!productId) return
    savePersonalizerSession(productId, userId, historyRef.current.present)
  }, [productId, userId])

  const setActiveSlot = useCallback(
    (index) => commit({ ...historyRef.current.present, activeSlotIndex: index, activeTextId: null }),
    [commit],
  )

  const updateSlotTransform = useCallback(
    (index, patch) => {
      const cur = historyRef.current.present
      const slots = cur.slots.map((s, i) =>
        i === index ? { ...s, transform: { ...s.transform, ...patch } } : s,
      )
      commit({ ...cur, slots })
    },
    [commit],
  )

  const resetSlotTransform = useCallback(
    (index) => updateSlotTransform(index, { ...DEFAULT_SLOT_TRANSFORM() }),
    [updateSlotTransform],
  )

  const setSlotPhoto = useCallback(
    (index, photoUrl, assetId = '') => {
      const cur = historyRef.current.present
      const slots = cur.slots.map((s, i) =>
        i === index ? { ...s, photoUrl, assetId, transform: { ...DEFAULT_SLOT_TRANSFORM() } } : s,
      )
      commit({ ...cur, slots })
      showToast('Photo added to slot')
    },
    [commit, showToast],
  )

  const flipSlot = useCallback(
    (index, axis) => {
      const cur = historyRef.current.present
      const slot = cur.slots[index]
      if (!slot) return
      updateSlotTransform(index, {
        flipX: axis === 'x' ? !slot.transform?.flipX : slot.transform?.flipX,
        flipY: axis === 'y' ? !slot.transform?.flipY : slot.transform?.flipY,
      })
    },
    [updateSlotTransform],
  )

  const toggleLayer = useCallback(
    (layerId) => {
      const cur = historyRef.current.present
      const layerState = { ...cur.layerState }
      const prev = layerState[layerId] || { visible: true, locked: false, opacity: 1 }
      layerState[layerId] = { ...prev, visible: !prev.visible }
      commit({
        ...cur,
        layerState,
        layerVisibility: mergeLayerVisibility(layerState),
      })
    },
    [commit],
  )

  const lockLayer = useCallback(
    (layerId) => {
      const cur = historyRef.current.present
      const layerState = { ...cur.layerState }
      const prev = layerState[layerId] || { visible: true, locked: false, opacity: 1 }
      layerState[layerId] = { ...prev, locked: !prev.locked }
      commit({ ...cur, layerState })
    },
    [commit],
  )

  const setLayerOpacity = useCallback(
    (layerId, opacity) => {
      const cur = historyRef.current.present
      const layerState = { ...cur.layerState }
      layerState[layerId] = { ...(layerState[layerId] || {}), opacity }
      commit({ ...cur, layerState })
    },
    [commit],
  )

  const setBackground = useCallback(
    (patch) => {
      const cur = historyRef.current.present
      commit({ ...cur, background: { ...cur.background, ...patch } })
    },
    [commit],
  )

  const addTextLayer = useCallback(() => {
    const cur = historyRef.current.present
    const layer = DEFAULT_TEXT_LAYER()
    layer.x = cur.canvas.width / 2
    layer.y = cur.canvas.height / 2
    commit({
      ...cur,
      textLayers: [...cur.textLayers, layer],
      activeTextId: layer.id,
    })
  }, [commit])

  const updateTextLayer = useCallback(
    (id, patch) => {
      const cur = historyRef.current.present
      commit({
        ...cur,
        textLayers: cur.textLayers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })
    },
    [commit],
  )

  const removeTextLayer = useCallback(
    (id) => {
      const cur = historyRef.current.present
      commit({
        ...cur,
        textLayers: cur.textLayers.filter((t) => t.id !== id),
        activeTextId: cur.activeTextId === id ? null : cur.activeTextId,
      })
    },
    [commit],
  )

  const duplicateTextLayer = useCallback(
    (id) => {
      const cur = historyRef.current.present
      const src = cur.textLayers.find((t) => t.id === id)
      if (!src) return
      const copy = { ...src, id: `text-${Date.now()}`, x: src.x + 20, y: src.y + 20 }
      commit({ ...cur, textLayers: [...cur.textLayers, copy], activeTextId: copy.id })
    },
    [commit],
  )

  const addClipartLayer = useCallback(
    (src) => {
      const cur = historyRef.current.present
      const layer = { ...DEFAULT_CLIPART_LAYER(), src, x: cur.canvas.width / 2 - 60, y: cur.canvas.height / 2 - 60 }
      commit({ ...cur, clipartLayers: [...cur.clipartLayers, layer] })
    },
    [commit],
  )

  const setZoom = useCallback(
    (zoom) => commit({ ...historyRef.current.present, zoom: Math.max(0.25, Math.min(3, zoom)) }),
    [commit],
  )

  const setTheme = useCallback(
    (theme) => commit({ ...historyRef.current.present, theme }),
    [commit],
  )

  const applyPersonalizerConfig = useCallback(
    (config) => {
      const cur = historyRef.current.present
      commit({
        ...cur,
        canvas: config.canvas,
        frameUrl: config.frameUrl,
        maskUrl: config.maskUrl,
        overlayUrl: config.overlayUrl,
        slots: config.slots,
        printArea: config.printArea,
        safeArea: config.safeArea,
      })
    },
    [commit],
  )

  const renderPreview = useCallback(async () => {
    setRendering(true)
    try {
      const result = await renderPersonalizer(historyRef.current.present)
      setPreviewUrl(result.dataUrl)
      return result
    } finally {
      setRendering(false)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => {
      renderPreview()
      if (mode === 'customer') persistSession()
    }, 100)
    return () => clearTimeout(t)
  }, [state.slots, state.textLayers, state.clipartLayers, state.layerState, state.background, state.layerVisibility, ready, renderPreview, persistSession, mode])

  const exportAll = useCallback(async () => {
    const exports = await exportPersonalizerVariants(historyRef.current.present)
    persistSession()
    return exports
  }, [persistSession])

  const getState = useCallback(() => historyRef.current.present, [])

  return useMemo(
    () => ({
      ready,
      rendering,
      previewUrl,
      toast,
      state,
      activeSlotIndex: state.activeSlotIndex,
      canUndo: canUndo(historyRef.current),
      canRedo: canRedo(historyRef.current),
      historySteps: historyRef.current.past.length,
      setActiveSlot,
      updateSlotTransform,
      resetSlotTransform,
      setSlotPhoto,
      flipSlot,
      toggleLayer,
      lockLayer,
      setLayerOpacity,
      setBackground,
      addTextLayer,
      updateTextLayer,
      removeTextLayer,
      duplicateTextLayer,
      addClipartLayer,
      setZoom,
      setTheme,
      applyPersonalizerConfig,
      undo,
      redo,
      renderPreview,
      exportAll,
      getState,
      persistSession,
      showToast,
    }),
    [
      ready,
      rendering,
      previewUrl,
      toast,
      state,
      setActiveSlot,
      updateSlotTransform,
      resetSlotTransform,
      setSlotPhoto,
      flipSlot,
      toggleLayer,
      lockLayer,
      setLayerOpacity,
      setBackground,
      addTextLayer,
      updateTextLayer,
      removeTextLayer,
      duplicateTextLayer,
      addClipartLayer,
      setZoom,
      setTheme,
      applyPersonalizerConfig,
      undo,
      redo,
      renderPreview,
      exportAll,
      getState,
      persistSession,
      showToast,
    ],
  )
}

export { LAYER_IDS }
