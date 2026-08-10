export function SlotManagerPanel({ mockupValue, onMockupChange }) {
  const canvasW = Number(mockupValue.canvasWidth || 1000)
  const canvasH = Number(mockupValue.canvasHeight || 1000)
  const boxes = mockupValue.multiSlot && mockupValue.photoBoxes?.length
    ? mockupValue.photoBoxes
    : [mockupValue.photoBox || { x: 0, y: 0, width: 100, height: 100, rotate: 0, borderRadius: 0 }]

  const patchSlot = (index, patch) => {
    const next = boxes.map((b, i) => (i === index ? { ...b, ...patch } : b))
    if (mockupValue.multiSlot) onMockupChange({ photoBoxes: next, photoBox: next[0] })
    else onMockupChange({ photoBox: next[0] })
  }

  return (
    <div className="peditor-slots">
      <p className="peditor-hint">Photo slot positions sync with MockupEditor. Edit numeric values below.</p>
      {boxes.map((box, index) => (
        <div key={index} className="peditor-slot-card">
          <strong>Slot {index + 1}</strong>
          <div className="peditor-slot-grid">
            <label>X<input type="number" value={box.x ?? 0} onChange={(e) => patchSlot(index, { x: Number(e.target.value) })} /></label>
            <label>Y<input type="number" value={box.y ?? 0} onChange={(e) => patchSlot(index, { y: Number(e.target.value) })} /></label>
            <label>W<input type="number" value={box.width ?? 0} onChange={(e) => patchSlot(index, { width: Number(e.target.value) })} /></label>
            <label>H<input type="number" value={box.height ?? 0} onChange={(e) => patchSlot(index, { height: Number(e.target.value) })} /></label>
            <label>Rotate<input type="number" value={box.rotate ?? 0} onChange={(e) => patchSlot(index, { rotate: Number(e.target.value) })} /></label>
            <label>Radius<input type="number" value={box.borderRadius ?? 0} onChange={(e) => patchSlot(index, { borderRadius: Number(e.target.value) })} /></label>
          </div>
          <small>Canvas {canvasW}×{canvasH}px</small>
        </div>
      ))}
    </div>
  )
}
