import { useRef, useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePersonalizer } from '../hooks/usePersonalizer'
import { PersonalizerKonvaCanvas } from '../canvas/PersonalizerKonvaCanvas'
import { FloatingToolbar } from '../components/FloatingToolbar'
import { LayersTimeline, TextLayersList } from '../components/LayersTimeline'
import { TextEditorPanel, BackgroundPanel, ClipArtPanel } from '../components/SettingsPanels'

export function PersonalizerStudio({
  product,
  mode = 'customer',
  onPhotoSelect,
  onEditorReady,
  compact = false,
  slotPhotos,
}) {
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [activeLayer, setActiveLayer] = useState('customerImage')
  const [settingsTab, setSettingsTab] = useState('text')
  const [activeTextId, setActiveTextId] = useState(null)

  const editor = usePersonalizer({
    product,
    userId: user?.id || user?._id || 'guest',
    mode,
  })

  const {
    ready,
    rendering,
    previewUrl,
    toast,
    state,
    activeSlotIndex,
    canUndo,
    canRedo,
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
    undo,
    redo,
    exportAll,
    getState,
    historySteps,
  } = editor

  const activeText = state.textLayers?.find((t) => t.id === (activeTextId || state.activeTextId))

  useEffect(() => {
    onEditorReady?.({ exportAll, setSlotPhoto, setActiveSlot, getState })
  }, [exportAll, setSlotPhoto, setActiveSlot, getState, onEditorReady])

  useEffect(() => {
    if (!slotPhotos?.length) return
    slotPhotos.forEach((photo, index) => {
      if (photo?.url && state.slots[index]?.photoUrl !== photo.url) {
        setSlotPhoto(index, photo.url, photo.assetId || '')
      }
    })
  }, [slotPhotos, state.slots, setSlotPhoto])

  const openUpload = () => fileRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (onPhotoSelect) await onPhotoSelect(file, activeSlotIndex)
    else setSlotPhoto(activeSlotIndex, URL.createObjectURL(file))
  }

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault()
      setZoom((state.zoom || 1) + (e.deltaY < 0 ? 0.06 : -0.06))
    },
    [setZoom, state.zoom],
  )

  const stageW = compact ? 360 : 520
  const stageH = compact ? 360 : 520

  if (!ready) {
    return (
      <div className="personalizer-skeleton">
        <div className="personalizer-skeleton__box" />
        <p>Initializing personalizer…</p>
      </div>
    )
  }

  const themeClass = state.theme === 'dark' ? 'personalizer--dark' : 'personalizer--light'

  return (
    <div className={`personalizer ${themeClass} ${compact ? 'personalizer--compact' : ''}`}>
      {!compact && (
        <FloatingToolbar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onUpload={openUpload}
          onReset={() => resetSlotTransform(activeSlotIndex)}
          onFlipH={() => flipSlot(activeSlotIndex, 'x')}
          onFlipV={() => flipSlot(activeSlotIndex, 'y')}
          onZoomIn={() => setZoom((state.zoom || 1) + 0.1)}
          onZoomOut={() => setZoom((state.zoom || 1) - 0.1)}
          slotCount={state.slots.length}
          activeSlotIndex={activeSlotIndex}
          onSelectSlot={setActiveSlot}
        />
      )}

      <div className="personalizer__layout">
        {!compact && (
          <aside className="personalizer__preview-pane">
            <span className="personalizer__pane-label">Preview</span>
            {previewUrl ? (
              <img src={previewUrl} alt="Live preview" className="personalizer__preview-img" />
            ) : (
              <div className="personalizer__preview-placeholder">Rendering…</div>
            )}
            {rendering && <div className="personalizer__render-badge">Updating…</div>}
          </aside>
        )}

        <main className="personalizer__canvas-pane">
          <span className="personalizer__pane-label">Canvas</span>
          <PersonalizerKonvaCanvas
            state={state}
            activeSlotIndex={activeSlotIndex}
            onSelectSlot={setActiveSlot}
            onSlotTransform={updateSlotTransform}
            onTextSelect={setActiveTextId}
            onTextUpdate={updateTextLayer}
            width={stageW}
            height={stageH}
            onWheelZoom={handleWheel}
            onDoubleClickReset={resetSlotTransform}
          />
          {!state.slots.some((s) => s.photoUrl) && (
            <button type="button" className="personalizer__upload-overlay" onClick={openUpload}>
              Upload photo — slot {activeSlotIndex + 1}
            </button>
          )}
        </main>

        {!compact && (
          <aside className="personalizer__settings-pane">
            <div className="personalizer__settings-tabs">
              {['text', 'background', 'clipart', 'history'].map((tab) => (
                <button key={tab} type="button" className={settingsTab === tab ? 'is-active' : ''} onClick={() => setSettingsTab(tab)}>
                  {tab}
                </button>
              ))}
              <button type="button" onClick={() => setTheme(state.theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
                {state.theme === 'dark' ? '☀' : '🌙'}
              </button>
            </div>
            {settingsTab === 'text' && (
              <TextEditorPanel
                textLayer={activeText}
                onChange={(patch) => activeText && updateTextLayer(activeText.id, patch)}
                onAdd={addTextLayer}
                onRemove={() => activeText && removeTextLayer(activeText.id)}
              />
            )}
            {settingsTab === 'background' && <BackgroundPanel background={state.background} onChange={setBackground} />}
            {settingsTab === 'clipart' && <ClipArtPanel onAddClipart={addClipartLayer} />}
            {settingsTab === 'history' && (
              <div className="personalizer-panel">
                <h4>History</h4>
                <p>{historySteps} undo steps available</p>
              </div>
            )}
            <TextLayersList
              textLayers={state.textLayers}
              activeTextId={activeText?.id}
              onSelect={setActiveTextId}
              onDuplicate={duplicateTextLayer}
              onRemove={removeTextLayer}
            />
          </aside>
        )}
      </div>

      {!compact && (
        <footer className="personalizer__timeline">
          <LayersTimeline
            layerState={state.layerState}
            activeLayer={activeLayer}
            onSelect={setActiveLayer}
            onToggle={toggleLayer}
            onLock={lockLayer}
            onOpacity={setLayerOpacity}
          />
        </footer>
      )}

      {toast && <div className="personalizer-toast">{toast}</div>}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </div>
  )
}
