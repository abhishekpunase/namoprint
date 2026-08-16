import { useMemo, useRef, useState } from 'react'
import { FiCrosshair, FiPlus, FiTrash2, FiUploadCloud, FiRotateCcw, FiRotateCw } from 'react-icons/fi'
import { AdminToggle } from './ui/AdminToggle'
import { analyzeMockupFile, analyzeMockupFromUrl, defaultInsetBox } from '../../utils/mockupAnalyzer'
import { photoBoxToStyle } from '../../utils/mockupLayout'

const ANALYZE_OPTS = { forAdmin: true }
const emptyBox = () => ({ x: 0, y: 0, width: 100, height: 100, rotate: 0, borderRadius: 0 })
const RESIZE_HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
const MIN_BOX = 20

function resizeBox(orig, mode, dx, dy, canvasW, canvasH) {
  let x = Number(orig.x) || 0
  let y = Number(orig.y) || 0
  let width = Number(orig.width) || MIN_BOX
  let height = Number(orig.height) || MIN_BOX

  if (mode.includes('e')) {
    width = Math.max(MIN_BOX, Math.min(canvasW - x, orig.width + dx))
  }
  if (mode.includes('s')) {
    height = Math.max(MIN_BOX, Math.min(canvasH - y, orig.height + dy))
  }
  if (mode.includes('w')) {
    const nextW = Math.max(MIN_BOX, orig.width - dx)
    const nextX = orig.x + (orig.width - nextW)
    if (nextX >= 0 && nextX + nextW <= canvasW) {
      x = nextX
      width = nextW
    } else if (nextX < 0) {
      width = Math.max(MIN_BOX, orig.x + orig.width)
      x = 0
    }
  }
  if (mode.includes('n')) {
    const nextH = Math.max(MIN_BOX, orig.height - dy)
    const nextY = orig.y + (orig.height - nextH)
    if (nextY >= 0 && nextY + nextH <= canvasH) {
      y = nextY
      height = nextH
    } else if (nextY < 0) {
      height = Math.max(MIN_BOX, orig.y + orig.height)
      y = 0
    }
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
    rotate: Number(orig.rotate) || 0,
    borderRadius: Number(orig.borderRadius) || 0,
  }
}

function normalizeAngle(deg) {
  let n = ((Number(deg) || 0) % 360 + 360) % 360
  if (n > 180) n -= 360
  return Math.round(n * 10) / 10
}

export function MockupEditor({ value, onChange, onUploadFrame, uploading = false }) {
  const previewRef = useRef(null)
  const dragRef = useRef(null)
  const [activeBoxIndex, setActiveBoxIndex] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)

  const canvasW = Number(value.canvasWidth || 1000)
  const canvasH = Number(value.canvasHeight || 1000)
  const mockupCanvas = useMemo(() => ({ width: canvasW, height: canvasH }), [canvasW, canvasH])
  const multiSlot = Boolean(value.multiSlot)
  const boxes = multiSlot && value.photoBoxes?.length ? value.photoBoxes : [value.photoBox || emptyBox()]
  const activeBox = boxes[activeBoxIndex] || boxes[0] || emptyBox()
  const layoutFit = useMemo(() => ({ left: 0, top: 0, width: 100, height: 100 }), [])

  const boxStyle = (box) =>
    photoBoxToStyle(box, mockupCanvas, {
      fit: layoutFit,
      transparent: true,
    })

  const patchBox = (index, patch) => {
    const nextBoxes = boxes.map((box, i) => (i === index ? { ...box, ...patch } : box))
    if (multiSlot || nextBoxes.length > 1) {
      onChange({
        multiSlot: true,
        photoBoxes: nextBoxes,
        photoBox: nextBoxes[0],
        slotCount: nextBoxes.length,
      })
    } else {
      onChange({ photoBox: nextBoxes[0], photoBoxes: [], multiSlot: false, slotCount: 1 })
    }
  }

  const patchActive = (patch) => patchBox(activeBoxIndex, patch)

  const applyAnalysis = (analysis) => {
    const detected =
      analysis.photoBoxes?.length > 1
        ? analysis.photoBoxes
        : analysis.photoBox
          ? [analysis.photoBox]
          : []
    const multi = detected.length > 1
    onChange({
      canvasWidth: String(analysis.canvasWidth),
      canvasHeight: String(analysis.canvasHeight),
      photoBox: detected[0]
        ? {
            ...detected[0],
            ...(detected[0].clipPath ? { clipPath: detected[0].clipPath } : {}),
          }
        : analysis.photoBox,
      // Keep clipPath / fillRatio so storefront can mask photos like the hex frame.
      photoBoxes: multi
        ? detected.map((box) => ({
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            rotate: box.rotate || 0,
            borderRadius: box.borderRadius || 0,
            ...(box.clipPath ? { clipPath: box.clipPath } : {}),
            ...(box.fillRatio != null ? { fillRatio: box.fillRatio } : {}),
            ...(box.slotShape ? { slotShape: box.slotShape } : {}),
          }))
        : [],
      multiSlot: multi,
      slotCount: detected.length || analysis.slotCount || 1,
      analyzeError: '',
    })
    setActiveBoxIndex(0)
  }

  const handleFrameUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAnalyzing(true)
    try {
      const analysis = await analyzeMockupFile(file, ANALYZE_OPTS)
      applyAnalysis(analysis)
      const url = await onUploadFrame(file)
      if (url) onChange({ frameImage: url })
    } catch (err) {
      onChange({ analyzeError: err.message })
    } finally {
      setAnalyzing(false)
      event.target.value = ''
    }
  }

  const autoDetect = async () => {
    if (!value.frameImage) return
    setAnalyzing(true)
    try {
      const analysis = await analyzeMockupFromUrl(value.frameImage, ANALYZE_OPTS)
      applyAnalysis(analysis)
    } catch (err) {
      onChange({ analyzeError: err.message })
    } finally {
      setAnalyzing(false)
    }
  }

  const pointerAngleOnBox = (event, box, rect) => {
    const cx = rect.left + ((Number(box.x) + Number(box.width) / 2) / canvasW) * rect.width
    const cy = rect.top + ((Number(box.y) + Number(box.height) / 2) / canvasH) * rect.height
    return (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI
  }

  const startDrag = (event, mode, boxIndex = activeBoxIndex) => {
    event.preventDefault()
    event.stopPropagation()
    const rect = previewRef.current?.getBoundingClientRect()
    if (!rect) return
    const box = boxes[boxIndex] || emptyBox()
    const fitW = Math.max(8, (rect.width * (layoutFit.width || 100)) / 100)
    const fitH = Math.max(8, (rect.height * (layoutFit.height || 100)) / 100)
    setActiveBoxIndex(boxIndex)
    dragRef.current = {
      mode,
      boxIndex,
      fitW,
      fitH,
      rect,
      startX: event.clientX,
      startY: event.clientY,
      startAngle: mode === 'rotate' ? pointerAngleOnBox(event, box, rect) : 0,
      orig: { ...box },
    }
    window.addEventListener('pointermove', onDrag)
    window.addEventListener('pointerup', stopDrag)
  }

  const onDrag = (event) => {
    const ds = dragRef.current
    if (!ds) return
    const dx = ((event.clientX - ds.startX) / ds.fitW) * canvasW
    const dy = ((event.clientY - ds.startY) / ds.fitH) * canvasH

    if (ds.mode === 'move') {
      patchBox(ds.boxIndex, {
        x: Math.round(Math.max(0, Math.min(canvasW - ds.orig.width, ds.orig.x + dx))),
        y: Math.round(Math.max(0, Math.min(canvasH - ds.orig.height, ds.orig.y + dy))),
      })
      return
    }

    if (ds.mode === 'rotate') {
      const angle = pointerAngleOnBox(event, ds.orig, ds.rect)
      const delta = angle - ds.startAngle
      patchBox(ds.boxIndex, {
        rotate: normalizeAngle((Number(ds.orig.rotate) || 0) + delta),
      })
      return
    }

    patchBox(ds.boxIndex, resizeBox(ds.orig, ds.mode, dx, dy, canvasW, canvasH))
  }

  const stopDrag = () => {
    dragRef.current = null
    window.removeEventListener('pointermove', onDrag)
    window.removeEventListener('pointerup', stopDrag)
  }

  const nudgeRotate = (delta) => {
    patchActive({ rotate: normalizeAngle((Number(activeBox.rotate) || 0) + delta) })
  }

  const addPhotoBox = () => {
    const inset = defaultInsetBox(canvasW, canvasH, 0.2)
    const next = [...boxes, inset]
    onChange({ multiSlot: true, photoBoxes: next, photoBox: next[0], slotCount: next.length })
    setActiveBoxIndex(next.length - 1)
  }

  const removePhotoBox = (index) => {
    if (boxes.length <= 1) return
    const next = boxes.filter((_, i) => i !== index)
    onChange({
      multiSlot: next.length > 1,
      photoBoxes: next.length > 1 ? next : [],
      photoBox: next[0],
      slotCount: next.length,
    })
    setActiveBoxIndex(0)
  }

  return (
    <div className="admin-mockup-editor admin-mockup-editor-edit">
      <div className="admin-mockup-preview-wrap">
        <div className="admin-mockup-preview-head">
          <span className="admin-mockup-preview-title">Edit slots</span>
          {multiSlot && boxes.length > 1 ? (
            <span className="admin-mockup-slot-badge">{boxes.length} photo slots</span>
          ) : (
            <span className="admin-mockup-slot-badge">Single photo</span>
          )}
        </div>
        <div className="admin-mockup-preview-scroll">
          <div
            ref={previewRef}
            className="admin-mockup-preview admin-mockup-preview-large"
            style={{ aspectRatio: `${canvasW} / ${canvasH}` }}
          >
            {value.frameImage ? (
              <img src={value.frameImage} alt="" className="admin-mockup-frame" />
            ) : (
              <div className="admin-mockup-empty">Upload a PNG/SVG collage frame to begin</div>
            )}
            {value.frameImage &&
              boxes.map((box, index) => (
                <div
                  key={index}
                  className={`admin-mockup-box ${index === activeBoxIndex ? 'is-active' : ''}`}
                  style={boxStyle(box)}
                  onPointerDown={(e) => startDrag(e, 'move', index)}
                >
                  <span className="admin-mockup-box-label">Slot {index + 1}</span>
                  {index === activeBoxIndex && (
                    <>
                      <button
                        type="button"
                        className="admin-mockup-handle admin-mockup-handle--rotate"
                        aria-label="Rotate slot"
                        title="Drag to rotate"
                        onPointerDown={(e) => startDrag(e, 'rotate', index)}
                      />
                      {RESIZE_HANDLES.map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          className={`admin-mockup-handle admin-mockup-handle--${handle}`}
                          aria-label={`Resize ${handle}`}
                          onPointerDown={(e) => startDrag(e, handle, index)}
                        />
                      ))}
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
        <p className="admin-mockup-preview-tip">
          Drag to move · sides/corners resize · top handle rotates · use ± buttons for fine rotate
        </p>
      </div>

      <div className="admin-mockup-controls">
        <label className="btn btn-ghost admin-upload-btn">
          <FiUploadCloud /> {uploading || analyzing ? 'Processing…' : value.frameImage ? 'Replace product mockup frame' : 'Upload product mockup frame (PNG/SVG)'}
          <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" hidden onChange={handleFrameUpload} disabled={uploading || analyzing} />
        </label>

        {value.frameImage && (
          <>
            <button type="button" className="btn btn-ghost" onClick={autoDetect} disabled={analyzing}>
              <FiCrosshair /> {analyzing ? 'Detecting slots…' : 'Auto-detect all photo slots'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => onChange({ frameImage: '' })}>
              Remove mockup
            </button>
          </>
        )}

        <AdminToggle
          label="Collage / multi-photo slots"
          checked={multiSlot}
          onChange={(e) =>
            onChange({
              multiSlot: e.target.checked,
              photoBoxes: e.target.checked ? boxes : [],
              photoBox: boxes[0],
              slotCount: e.target.checked ? boxes.length : 1,
            })
          }
        />

        {multiSlot && (
          <div className="admin-mockup-slot-tabs">
            {boxes.map((_, index) => (
              <button
                key={index}
                type="button"
                className={index === activeBoxIndex ? 'is-active' : ''}
                onClick={() => setActiveBoxIndex(index)}
              >
                Slot {index + 1}
              </button>
            ))}
            <button type="button" onClick={addPhotoBox}>
              <FiPlus /> Add slot
            </button>
            {boxes.length > 1 && (
              <button type="button" onClick={() => removePhotoBox(activeBoxIndex)}>
                <FiTrash2 /> Remove slot
              </button>
            )}
          </div>
        )}

        <div className="admin-mockup-rotate-bar">
          <span>Rotate</span>
          <button type="button" className="btn btn-ghost" onClick={() => nudgeRotate(-15)} title="Rotate left 15°">
            <FiRotateCcw /> −15°
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => nudgeRotate(-1)} title="Rotate left 1°">
            −1°
          </button>
          <input
            type="number"
            step="0.5"
            value={activeBox.rotate ?? 0}
            onChange={(e) => patchActive({ rotate: Number(e.target.value) })}
            aria-label="Rotate degrees"
          />
          <button type="button" className="btn btn-ghost" onClick={() => nudgeRotate(1)} title="Rotate right 1°">
            +1°
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => nudgeRotate(15)} title="Rotate right 15°">
            <FiRotateCw /> +15°
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => patchActive({ rotate: 0 })}>
            Reset
          </button>
        </div>

        <div className="admin-mockup-grid">
          <label>
            Canvas width
            <input type="number" min="1" value={value.canvasWidth} onChange={(e) => onChange({ canvasWidth: e.target.value })} />
          </label>
          <label>
            Canvas height
            <input type="number" min="1" value={value.canvasHeight} onChange={(e) => onChange({ canvasHeight: e.target.value })} />
          </label>
          <label>
            Photo X
            <input type="number" value={activeBox.x ?? 0} onChange={(e) => patchActive({ x: Number(e.target.value) })} />
          </label>
          <label>
            Photo Y
            <input type="number" value={activeBox.y ?? 0} onChange={(e) => patchActive({ y: Number(e.target.value) })} />
          </label>
          <label>
            Photo width
            <input type="number" value={activeBox.width ?? 0} onChange={(e) => patchActive({ width: Number(e.target.value) })} />
          </label>
          <label>
            Photo height
            <input type="number" value={activeBox.height ?? 0} onChange={(e) => patchActive({ height: Number(e.target.value) })} />
          </label>
          <label>
            Corner radius
            <input type="number" min="0" value={activeBox.borderRadius ?? 0} onChange={(e) => patchActive({ borderRadius: Number(e.target.value) })} />
          </label>
        </div>

        <p className="admin-mockup-hint">
          Sides resize width/height · corners free resize · top orange handle rotates the slot.
          {multiSlot ? ` ${boxes.length} slot${boxes.length === 1 ? '' : 's'} configured.` : ' Single photo window.'}
          {value.analyzeError ? ` Error: ${value.analyzeError}` : ''}
        </p>
      </div>
    </div>
  )
}
