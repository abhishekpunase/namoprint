import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_LAYER_VISIBILITY, DEFAULT_SLOT_TRANSFORM } from '../constants'
import { renderSmartMockup, exportSmartMockupVariants } from '../SmartMockupCompositor'
import { extractSmartMockupFromProduct, loadEditorSession, saveEditorSession } from '../SmartMockupStorage'
import { createHistory, pushHistory, undoHistory, redoHistory, canUndo, canRedo } from '../SmartMockupHistory'
import { generateSmartMockupFromUrl } from '../SmartMockupEngine'

function buildInitialState(product, session) {
  const config = extractSmartMockupFromProduct(product)
  const baseSlots = session?.slots?.length
    ? session.slots
    : config.slots?.length
      ? config.slots
      : (config.photoBoxes || []).map((box, i) => ({
          id: `slot-${i + 1}`,
          layerIndex: i,
          ...box,
          scale: 1,
          transform: { ...DEFAULT_SLOT_TRANSFORM() },
          photoUrl: '',
          assetId: '',
        }))

  return {
    canvas: config.canvas,
    frameUrl: config.frameUrl,
    overlayUrl: config.overlayUrl || '',
    maskUrl: config.maskUrl || '',
    slots: baseSlots,
    layerVisibility: session?.layerVisibility || config.layerVisibility || { ...DEFAULT_LAYER_VISIBILITY },
    activeSlotIndex: 0,
  }
}

export function useSmartMockupEditor({ product, userId, onExport, onChange }) {
  const productId = product?._id || product?.slug
  const [ready, setReady] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const historyRef = useRef(createHistory(buildInitialState(product, null)))
  const [, tick] = useState(0)
  const forceUpdate = () => tick((n) => n + 1)

  const state = historyRef.current.present

  useEffect(() => {
    let cancelled = false
    async function init() {
      setReady(false)
      const session = productId ? loadEditorSession(productId, userId) : null
      let initial = buildInitialState(product, session)

      if (!initial.overlayUrl && initial.frameUrl) {
        try {
          const smart = await generateSmartMockupFromUrl(initial.frameUrl)
          initial = {
            ...initial,
            overlayUrl: smart.overlayUrl,
            maskUrl: smart.maskUrl,
            slots: smart.slots.map((s, i) => ({
              ...s,
              ...(session?.slots?.[i] || {}),
            })),
            canvas: smart.canvas,
          }
        } catch {
          /* use basic state */
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

  const commit = useCallback(
    (next) => {
      historyRef.current = pushHistory(historyRef.current, next)
      forceUpdate()
      onChange?.(next)
    },
    [onChange],
  )

  const undo = useCallback(() => {
    historyRef.current = undoHistory(historyRef.current)
    forceUpdate()
  }, [])

  const redo = useCallback(() => {
    historyRef.current = redoHistory(historyRef.current)
    forceUpdate()
  }, [])

  const setActiveSlot = useCallback(
    (index) => commit({ ...historyRef.current.present, activeSlotIndex: index }),
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
    },
    [commit],
  )

  const toggleLayer = useCallback(
    (layerId) => {
      const cur = historyRef.current.present
      commit({
        ...cur,
        layerVisibility: {
          ...cur.layerVisibility,
          [layerId]: !cur.layerVisibility[layerId],
        },
      })
    },
    [commit],
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

  const persistSession = useCallback(() => {
    if (!productId) return
    saveEditorSession(productId, userId, {
      slots: historyRef.current.present.slots,
      layerVisibility: historyRef.current.present.layerVisibility,
      canvas: historyRef.current.present.canvas,
    })
  }, [productId, userId])

  const renderPreview = useCallback(async () => {
    setRendering(true)
    try {
      const result = await renderSmartMockup(historyRef.current.present)
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
      persistSession()
    }, 120)
    return () => clearTimeout(t)
  }, [state.slots, state.layerVisibility, ready, renderPreview, persistSession])

  const exportAll = useCallback(async () => {
    const exports = await exportSmartMockupVariants(historyRef.current.present)
    onExport?.(exports)
    persistSession()
    return exports
  }, [onExport, persistSession])

  return useMemo(
    () => ({
      ready,
      rendering,
      previewUrl,
      state,
      activeSlot: state.slots[state.activeSlotIndex],
      activeSlotIndex: state.activeSlotIndex,
      canUndo: canUndo(historyRef.current),
      canRedo: canRedo(historyRef.current),
      setActiveSlot,
      updateSlotTransform,
      resetSlotTransform,
      setSlotPhoto,
      toggleLayer,
      flipSlot,
      undo,
      redo,
      renderPreview,
      exportAll,
      persistSession,
    }),
    [
      ready,
      rendering,
      previewUrl,
      state,
      setActiveSlot,
      updateSlotTransform,
      resetSlotTransform,
      setSlotPhoto,
      toggleLayer,
      flipSlot,
      undo,
      redo,
      renderPreview,
      exportAll,
      persistSession,
    ],
  )
}
