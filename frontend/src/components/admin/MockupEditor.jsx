import { useEffect, useMemo, useRef, useState } from 'react'
import { FiCrosshair, FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { AdminToggle } from './ui/AdminToggle'
import { analyzeMockupFile, analyzeMockupFromUrl, defaultInsetBox } from '../../utils/mockupAnalyzer'
import { getObjectContainFit, photoBoxToStyle, resolveMockupLayout } from '../../utils/mockupLayout'

const ANALYZE_OPTS = { forAdmin: true }
const emptyBox = () => ({ x: 0, y: 0, width: 100, height: 100, rotate: 0, borderRadius: 0 })

export function MockupEditor({ value, onChange, onUploadFrame, uploading = false }) {
  const previewRef = useRef(null)
  const dragRef = useRef(null)
  const [activeBoxIndex, setActiveBoxIndex] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [layoutFit, setLayoutFit] = useState({ left: 0, top: 0, width: 100, height: 100 })

  const canvasW = Number(value.canvasWidth || 1000)
  const canvasH = Number(value.canvasHeight || 1000)
  const mockupCanvas = useMemo(() => ({ width: canvasW, height: canvasH }), [canvasW, canvasH])
  const multiSlot = Boolean(value.multiSlot)
  const boxes = multiSlot && value.photoBoxes?.length ? value.photoBoxes : [value.photoBox || emptyBox()]
  const activeBox = boxes[activeBoxIndex] || boxes[0] || emptyBox()

  useEffect(() => {
    let cancelled = false
    resolveMockupLayout(value.frameImage, mockupCanvas, boxes)
      .then((layout) => {
        if (!cancelled) setLayoutFit(layout.fit || getObjectContainFit(mockupCanvas, mockupCanvas))
      })
      .catch(() => {
        if (!cancelled) setLayoutFit(getObjectContainFit(mockupCanvas, mockupCanvas))
      })
    return () => {
      cancelled = true
    }
  }, [value.frameImage, mockupCanvas, boxes.length])

  const boxStyle = (box) =>
    photoBoxToStyle(box, mockupCanvas, {
      fit: layoutFit,
      transparent: true,
    })

  const patchBox = (index, patch) => {
    const nextBoxes = boxes.map((box, i) => (i === index ? { ...box, ...patch } : box))
    if (multiSlot) {
      onChange({ photoBoxes: nextBoxes, photoBox: nextBoxes[0] })
    } else {
      onChange({ photoBox: nextBoxes[0], photoBoxes: [] })
    }
  }

  const patchActive = (patch) => patchBox(activeBoxIndex, patch)

  const applyAnalysis = (analysis) => {
    onChange({
      canvasWidth: String(analysis.canvasWidth),
      canvasHeight: String(analysis.canvasHeight),
      photoBox: analysis.photoBox,
      photoBoxes: analysis.photoBoxes,
      multiSlot: analysis.multiSlot,
      slotCount: analysis.slotCount,
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

  const startDrag = (event, mode) => {
    event.preventDefault()
    event.stopPropagation()
    const rect = previewRef.current?.getBoundingClientRect()
    if (!rect) return
    dragRef.current = {
      mode,
      rect,
      startX: event.clientX,
      startY: event.clientY,
      orig: { ...activeBox },
    }
    window.addEventListener('pointermove', onDrag)
    window.addEventListener('pointerup', stopDrag)
  }

  const onDrag = (event) => {
    const ds = dragRef.current
    if (!ds) return
    const dx = ((event.clientX - ds.startX) / ds.rect.width) * canvasW
    const dy = ((event.clientY - ds.startY) / ds.rect.height) * canvasH

    if (ds.mode === 'move') {
      patchActive({
        x: Math.round(Math.max(0, Math.min(canvasW - ds.orig.width, ds.orig.x + dx))),
        y: Math.round(Math.max(0, Math.min(canvasH - ds.orig.height, ds.orig.y + dy))),
      })
    } else {
      patchActive({
        width: Math.round(Math.max(20, Math.min(canvasW - ds.orig.x, ds.orig.width + dx))),
        height: Math.round(Math.max(20, Math.min(canvasH - ds.orig.y, ds.orig.height + dy))),
      })
    }
  }

  const stopDrag = () => {
    dragRef.current = null
    window.removeEventListener('pointermove', onDrag)
    window.removeEventListener('pointerup', stopDrag)
  }

  const addPhotoBox = () => {
    const inset = defaultInsetBox(canvasW, canvasH, 0.2)
    const next = [...boxes, inset]
    onChange({ multiSlot: true, photoBoxes: next, photoBox: next[0] })
    setActiveBoxIndex(next.length - 1)
  }

  const removePhotoBox = (index) => {
    if (boxes.length <= 1) return
    const next = boxes.filter((_, i) => i !== index)
    onChange({
      multiSlot: next.length > 1,
      photoBoxes: next.length > 1 ? next : [],
      photoBox: next[0],
    })
    setActiveBoxIndex(0)
  }

  const activeStyle = useMemo(() => boxStyle(activeBox), [activeBox, canvasW, canvasH])

  return (
    <div className="admin-mockup-editor admin-mockup-editor-stacked">
      <div className="admin-mockup-preview-wrap">
        <div className="admin-mockup-preview-head">
          <span className="admin-mockup-preview-title">Mockup preview</span>
          {multiSlot && boxes.length > 1 ? (
            <span className="admin-mockup-slot-badge">{boxes.length} photo slots</span>
          ) : (
            <span className="admin-mockup-slot-badge">Single photo</span>
          )}
        </div>
        <div
          ref={previewRef}
          className="admin-mockup-preview admin-mockup-preview-large"
          style={{ aspectRatio: `${canvasW} / ${canvasH}` }}
        >
          {value.frameImage ? (
            <div
              className="admin-mockup-fit"
              style={{
                left: `${layoutFit.left}%`,
                top: `${layoutFit.top}%`,
                width: `${layoutFit.width}%`,
                height: `${layoutFit.height}%`,
              }}
            >
              <img src={value.frameImage} alt="" className="admin-mockup-frame" />
            </div>
          ) : (
            <div className="admin-mockup-empty">Upload a PNG/SVG collage frame to begin</div>
          )}
          {value.frameImage &&
            boxes.map((box, index) => (
              <div
                key={index}
                className={`admin-mockup-box ${index === activeBoxIndex ? 'is-active' : ''}`}
                style={boxStyle(box)}
                onPointerDown={(e) => {
                  setActiveBoxIndex(index)
                  startDrag(e, 'move')
                }}
              >
                <span className="admin-mockup-box-label">Slot {index + 1}</span>
              </div>
            ))}
          {activeBox && value.frameImage && (
            <div
              className="admin-mockup-resize-handle"
              style={activeStyle}
              onPointerDown={(e) => startDrag(e, 'resize')}
            />
          )}
        </div>
        <p className="admin-mockup-preview-tip">Drag a slot to move · corner handle to resize</p>
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
            Rotate
            <input type="number" value={activeBox.rotate ?? 0} onChange={(e) => patchActive({ rotate: Number(e.target.value) })} />
          </label>
          <label>
            Corner radius
            <input type="number" min="0" value={activeBox.borderRadius ?? 0} onChange={(e) => patchActive({ borderRadius: Number(e.target.value) })} />
          </label>
        </div>

        <p className="admin-mockup-hint">
          Auto-detect finds every blank window — transparent holes, dark placeholders, and light green/white collage areas.
          {multiSlot ? ` ${boxes.length} slot${boxes.length === 1 ? '' : 's'} configured. Customers upload one photo per slot.` : ' Single photo window.'}
          {value.analyzeError ? ` Error: ${value.analyzeError}` : ''}
        </p>
      </div>
    </div>
  )
}
