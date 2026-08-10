import { FiRefreshCw, FiUpload, FiZoomIn, FiZoomOut } from 'react-icons/fi'

export function SmartMockupToolbar({
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
    <div className="smart-mockup-toolbar mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
      <button type="button" className="smart-mockup-btn" disabled={!canUndo} onClick={onUndo}>
        ↶ Undo
      </button>
      <button type="button" className="smart-mockup-btn" disabled={!canRedo} onClick={onRedo}>
        ↷ Redo
      </button>
      <span className="mx-1 h-6 w-px bg-gray-200" />
      <button type="button" className="smart-mockup-btn smart-mockup-btn--primary" onClick={onUpload}>
        <FiUpload /> Upload Photo
      </button>
      <button type="button" className="smart-mockup-btn" onClick={onZoomIn} title="Zoom in">
        <FiZoomIn />
      </button>
      <button type="button" className="smart-mockup-btn" onClick={onZoomOut} title="Zoom out">
        <FiZoomOut />
      </button>
      <button type="button" className="smart-mockup-btn" onClick={onReset} title="Reset slot">
        <FiRefreshCw />
      </button>
      <button type="button" className="smart-mockup-btn" onClick={onFlipH} title="Flip horizontal">
        ↔
      </button>
      <button type="button" className="smart-mockup-btn" onClick={onFlipV} title="Flip vertical">
        ↕
      </button>
      {slotCount > 1 &&
        Array.from({ length: slotCount }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`smart-mockup-btn ${i === activeSlotIndex ? 'is-active' : ''}`}
            onClick={() => onSelectSlot(i)}
          >
            Slot {i + 1}
          </button>
        ))}
    </div>
  )
}
