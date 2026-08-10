import { useRef, useCallback, useEffect } from 'react'
import { FiUpload } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useSmartMockupEditor } from '../hooks/useSmartMockupEditor'
import { SmartMockupToolbar } from './SmartMockupToolbar'
import { SmartMockupLayersPanel } from './SmartMockupLayersPanel'
import { buildCartSmartMockupPayload } from '../SmartMockupStorage'

export function SmartMockupEditor({
  product,
  slotPhotos,
  activeSlotIndex: externalActiveSlot,
  onPhotoSelect,
  onExport,
  onEditorReady,
  compact = false,
  showLayers = !compact,
}) {
  const { user } = useAuth()
  const fileRef = useRef(null)
  const dragRef = useRef(null)
  const stageRef = useRef(null)

  const editor = useSmartMockupEditor({
    product,
    userId: user?.id || user?._id || 'guest',
    onExport,
  })

  const {
    ready,
    rendering,
    previewUrl,
    state,
    activeSlotIndex,
    canUndo,
    canRedo,
    setActiveSlot,
    updateSlotTransform,
    resetSlotTransform,
    setSlotPhoto,
    toggleLayer,
    flipSlot,
    undo,
    redo,
    exportAll,
  } = editor

  useEffect(() => {
    onEditorReady?.({
      exportAll,
      setSlotPhoto,
      setActiveSlot,
      getState: () => state,
    })
  }, [exportAll, setSlotPhoto, setActiveSlot, state, onEditorReady])

  useEffect(() => {
    if (typeof externalActiveSlot !== 'number') return
    if (externalActiveSlot !== activeSlotIndex) setActiveSlot(externalActiveSlot)
  }, [externalActiveSlot, activeSlotIndex, setActiveSlot])

  useEffect(() => {
    if (!slotPhotos?.length) return
    slotPhotos.forEach((photo, index) => {
      if (!photo?.url) return
      const slot = state.slots[index]
      if (slot && slot.photoUrl !== photo.url) {
        setSlotPhoto(index, photo.url, photo.assetId || '')
      }
    })
  }, [slotPhotos, state.slots, setSlotPhoto])

  const openUpload = () => fileRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (onPhotoSelect) {
      await onPhotoSelect(file, activeSlotIndex)
    } else {
      setSlotPhoto(activeSlotIndex, URL.createObjectURL(file))
    }
  }

  const zoomBy = (delta) => {
    const slot = state.slots[activeSlotIndex]
    if (!slot) return
    const scale = Math.max(0.3, Math.min(4, (slot.transform?.scale || 1) + delta))
    updateSlotTransform(activeSlotIndex, { scale })
  }

  const onPointerDown = useCallback(
    (e) => {
      const slot = state.slots[activeSlotIndex]
      if (!slot?.photoUrl) return
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: slot.transform?.x || 0,
        origY: slot.transform?.y || 0,
      }
    },
    [state.slots, activeSlotIndex],
  )

  const onPointerMove = useCallback(
    (e) => {
      const ds = dragRef.current
      if (!ds) return
      const dx = (e.clientX - ds.startX) / (stageRef.current?.clientWidth || 1)
      const dy = (e.clientY - ds.startY) / (stageRef.current?.clientHeight || 1)
      updateSlotTransform(activeSlotIndex, {
        x: Math.max(-1.5, Math.min(1.5, ds.origX + dx)),
        y: Math.max(-1.5, Math.min(1.5, ds.origY + dy)),
      })
    },
    [activeSlotIndex, updateSlotTransform],
  )

  const onPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const onDoubleClick = () => resetSlotTransform(activeSlotIndex)

  const onWheel = (e) => {
    e.preventDefault()
    zoomBy(e.deltaY < 0 ? 0.08 : -0.08)
  }

  if (!ready) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
        Initializing Smart Mockup Engine…
      </div>
    )
  }

  const aspect = `${state.canvas.width} / ${state.canvas.height}`

  return (
    <div className="smart-mockup-editor">
      {!compact && (
        <SmartMockupToolbar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onUpload={openUpload}
          onReset={() => resetSlotTransform(activeSlotIndex)}
          onFlipH={() => flipSlot(activeSlotIndex, 'x')}
          onFlipV={() => flipSlot(activeSlotIndex, 'y')}
          onZoomIn={() => zoomBy(0.12)}
          onZoomOut={() => zoomBy(-0.12)}
          slotCount={state.slots.length}
          activeSlotIndex={activeSlotIndex}
          onSelectSlot={setActiveSlot}
        />
      )}

      <div className={`grid gap-3 ${showLayers ? 'lg:grid-cols-[1fr_200px]' : ''}`}>
        <div
          ref={stageRef}
          className="smart-mockup-stage relative overflow-hidden rounded-xl bg-gray-100"
          style={{ aspectRatio: aspect, maxHeight: compact ? 360 : 520 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onDoubleClick={onDoubleClick}
          onWheel={onWheel}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Live mockup preview" className="h-full w-full object-contain" draggable={false} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Rendering…</div>
          )}
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 text-xs font-medium">
              Updating preview…
            </div>
          )}
          {!state.slots.some((s) => s.photoUrl) && (
            <button
              type="button"
              onClick={openUpload}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 text-white"
            >
              <FiUpload size={28} />
              <span className="text-sm font-semibold">Upload photo to slot {activeSlotIndex + 1}</span>
            </button>
          )}
        </div>

        {showLayers && <SmartMockupLayersPanel layerVisibility={state.layerVisibility} onToggle={toggleLayer} />}
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </div>
  )
}

export { buildCartSmartMockupPayload }
