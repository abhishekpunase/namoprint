import { FiRefreshCw, FiUpload, FiZoomIn, FiZoomOut, FiRotateCcw, FiRotateCw } from 'react-icons/fi'

export function FloatingToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onUpload,
  onReset,
  onFlipH,
  onFlipV,
  onZoomIn,
  onZoomOut,
  slotCount,
  activeSlotIndex,
  onSelectSlot,
}) {
  return (
    <div className="personalizer-toolbar">
      <button type="button" disabled={!canUndo} onClick={onUndo} title="Undo">↶</button>
      <button type="button" disabled={!canRedo} onClick={onRedo} title="Redo">↷</button>
      <span className="personalizer-toolbar__sep" />
      <button type="button" className="personalizer-toolbar__primary" onClick={onUpload}><FiUpload /> Upload</button>
      <button type="button" onClick={onZoomIn} title="Zoom in"><FiZoomIn /></button>
      <button type="button" onClick={onZoomOut} title="Zoom out"><FiZoomOut /></button>
      <button type="button" onClick={onReset} title="Reset"><FiRefreshCw /></button>
      <button type="button" onClick={onFlipH} title="Flip H">↔</button>
      <button type="button" onClick={onFlipV} title="Flip V">↕</button>
      {slotCount > 1 &&
        Array.from({ length: slotCount }).map((_, i) => (
          <button key={i} type="button" className={i === activeSlotIndex ? 'is-active' : ''} onClick={() => onSelectSlot(i)}>
            {i + 1}
          </button>
        ))}
    </div>
  )
}
