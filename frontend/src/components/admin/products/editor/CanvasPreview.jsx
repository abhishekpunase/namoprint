import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import {
  Grid3X3,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Square,
  Upload,
  ImagePlus,
  Frame,
} from 'lucide-react'
import { getObjectContainFit, photoBoxToStyle, resolveMockupLayout } from '../../../../utils/mockupLayout'

export function PreviewToolbar({
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  showSafeArea,
  onToggleSafeArea,
  showPrintArea,
  onTogglePrintArea,
  onReset,
  onFullscreen,
}) {
  return (
    <div className="peditor-toolbar">
      <button type="button" className="peditor-toolbar__btn" onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))} aria-label="Zoom out">
        <Minus size={16} />
      </button>
      <span className="peditor-toolbar__zoom">{Math.round(zoom * 100)}%</span>
      <button type="button" className="peditor-toolbar__btn" onClick={() => onZoomChange(Math.min(2, zoom + 0.1))} aria-label="Zoom in">
        <Plus size={16} />
      </button>
      <button type="button" className={`peditor-toolbar__btn ${showGrid ? 'is-active' : ''}`} onClick={onToggleGrid} title="Toggle grid">
        <Grid3X3 size={16} />
      </button>
      <button type="button" className={`peditor-toolbar__btn ${showSafeArea ? 'is-active' : ''}`} onClick={onToggleSafeArea} title="Safe area">
        <Square size={16} />
      </button>
      <button type="button" className={`peditor-toolbar__btn ${showPrintArea ? 'is-active' : ''}`} onClick={onTogglePrintArea} title="Printable area">
        Print
      </button>
      <button type="button" className="peditor-toolbar__btn" onClick={onReset} title="Reset view">
        <RotateCcw size={16} />
      </button>
      <button type="button" className="peditor-toolbar__btn" onClick={onFullscreen} title="Fullscreen">
        <Maximize2 size={16} />
      </button>
    </div>
  )
}

function isMockupFrameFile(file) {
  const name = file.name?.toLowerCase() || ''
  const type = file.type?.toLowerCase() || ''
  return type.includes('svg') || type === 'image/png' || name.endsWith('.png') || name.endsWith('.svg')
}

export function CanvasPreview({
  form,
  mockupValue,
  previewMode = 'product',
  onUploadImages,
  onUploadFrame,
  uploading = false,
  analyzing = false,
}) {
  const wrapRef = useRef(null)
  const galleryInputRef = useRef(null)
  const frameInputRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(false)
  const [showSafeArea, setShowSafeArea] = useState(true)
  const [showPrintArea, setShowPrintArea] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const canvasW = Number(mockupValue.canvasWidth || 1000)
  const canvasH = Number(mockupValue.canvasHeight || 1000)
  const mockupCanvas = useMemo(() => ({ width: canvasW, height: canvasH }), [canvasW, canvasH])
  const printBoxes =
    mockupValue.multiSlot && mockupValue.photoBoxes?.length
      ? mockupValue.photoBoxes
      : [mockupValue.photoBox || {}]
  const [layoutFit, setLayoutFit] = useState({ left: 0, top: 0, width: 100, height: 100 })

  useEffect(() => {
    let cancelled = false
    resolveMockupLayout(form.frameImage, mockupCanvas, printBoxes)
      .then((layout) => {
        if (!cancelled) setLayoutFit(layout.fit || getObjectContainFit(mockupCanvas, mockupCanvas))
      })
      .catch(() => {
        if (!cancelled) setLayoutFit(getObjectContainFit(mockupCanvas, mockupCanvas))
      })
    return () => {
      cancelled = true
    }
  }, [form.frameImage, mockupCanvas, printBoxes.length])

  const boxStyle = (box) =>
    photoBoxToStyle(box, mockupCanvas, {
      fit: layoutFit,
      transparent: true,
    })

  const heroImage = previewMode === 'mockup' && form.frameImage
    ? form.frameImage
    : form.thumbnail || form.images?.[0]

  const hasVisual = Boolean(heroImage || form.frameImage)
  const busy = uploading || analyzing

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const routeFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || [])
      if (!files.length) return

      const frameFiles = []
      const galleryFiles = []

      for (const file of files) {
        if (isMockupFrameFile(file)) frameFiles.push(file)
        else galleryFiles.push(file)
      }

      if (galleryFiles.length && onUploadImages) {
        await onUploadImages(galleryFiles)
      }

      if (frameFiles.length && onUploadFrame) {
        for (const file of frameFiles) {
          await onUploadFrame(file)
        }
      }
    },
    [onUploadImages, onUploadFrame],
  )

  const onDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)
    if (busy) return
    await routeFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    if (!busy) setDragOver(true)
  }

  const onDragLeave = () => setDragOver(false)

  return (
    <div className={`peditor-preview ${isFullscreen ? 'is-fullscreen' : ''}`} ref={wrapRef}>
      <PreviewToolbar
        zoom={zoom}
        onZoomChange={setZoom}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
        showSafeArea={showSafeArea}
        onToggleSafeArea={() => setShowSafeArea((v) => !v)}
        showPrintArea={showPrintArea}
        onTogglePrintArea={() => setShowPrintArea((v) => !v)}
        onReset={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
        onFullscreen={toggleFullscreen}
      />

      <div
        className={`peditor-preview__stage ${dragOver ? 'is-drag-over' : ''} ${busy ? 'is-busy' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div
          className="peditor-preview__canvas"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            aspectRatio: `${canvasW} / ${canvasH}`,
          }}
        >
          {showGrid && <div className="peditor-preview__grid" aria-hidden="true" />}

          {form.frameImage && previewMode !== 'gallery' && (
            <div
              className="peditor-preview__fit"
              style={{
                left: `${layoutFit.left}%`,
                top: `${layoutFit.top}%`,
                width: `${layoutFit.width}%`,
                height: `${layoutFit.height}%`,
              }}
            >
              <img src={form.frameImage} alt="" className="peditor-preview__frame" />
            </div>
          )}

          {heroImage && !form.frameImage && (
            <img src={heroImage} alt="" className="peditor-preview__hero" />
          )}

          {showPrintArea && form.frameImage &&
            printBoxes.map((box, index) => (
              <div
                key={index}
                className="peditor-preview__print-area"
                style={boxStyle(box)}
                aria-hidden="true"
              />
            ))}

          {showSafeArea && (
            <div className="peditor-preview__safe-area" aria-hidden="true" />
          )}

          {!hasVisual && !busy && (
            <div className="peditor-preview__placeholder peditor-preview__upload-zone">
              <Upload size={32} strokeWidth={1.5} />
              <p>Live preview</p>
              <small>Drop PNG/SVG frame or product images here</small>
              <div className="peditor-preview__upload-actions">
                <button type="button" className="peditor-preview__upload-btn" onClick={() => frameInputRef.current?.click()}>
                  <Frame size={16} /> Mockup frame
                </button>
                <button type="button" className="peditor-preview__upload-btn" onClick={() => galleryInputRef.current?.click()}>
                  <ImagePlus size={16} /> Product image
                </button>
              </div>
            </div>
          )}

          {busy && (
            <div className="peditor-preview__loading">
              <span>{analyzing ? 'Detecting photo slots…' : 'Uploading…'}</span>
            </div>
          )}

          {hasVisual && !busy && (
            <div className="peditor-preview__overlay">
              <button type="button" className="peditor-preview__overlay-btn" onClick={() => frameInputRef.current?.click()} title="Upload mockup frame">
                <Frame size={16} /> Frame
              </button>
              <button type="button" className="peditor-preview__overlay-btn" onClick={() => galleryInputRef.current?.click()} title="Upload product image">
                <ImagePlus size={16} /> Image
              </button>
            </div>
          )}
        </div>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        hidden
        onChange={(e) => {
          routeFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={frameInputRef}
        type="file"
        accept="image/png,image/svg+xml,image/webp"
        hidden
        onChange={(e) => {
          routeFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div className="peditor-preview__tabs">
        <button type="button" className={previewMode === 'product' ? 'is-active' : ''}>Product</button>
        <button type="button" className={previewMode === 'mockup' ? 'is-active' : ''}>Mockup</button>
      </div>
    </div>
  )
}
