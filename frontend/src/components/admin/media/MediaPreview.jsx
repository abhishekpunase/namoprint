import { useEffect, useRef, useState } from 'react'
import {
  Copy,
  Download,
  ExternalLink,
  Maximize2,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { copyToClipboard } from '../../../utils/mediaAdminUtils'

export function MediaPreviewModal({ item, open, onClose, onDownload, onCopyUrl }) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!open) {
      setZoom(1)
      setRotation(0)
      setFullscreen(false)
    }
  }, [open])

  if (!open || !item) return null

  const url = item.previewUrl || item.url

  const handleCopy = async () => {
    await copyToClipboard(url)
    onCopyUrl?.()
  }

  const handleDownload = () => {
    onDownload?.(item)
    const a = document.createElement('a')
    a.href = url
    a.download = item.name || 'download'
    a.target = '_blank'
    a.rel = 'noopener'
    a.click()
  }

  return (
    <div className="med-modal-backdrop" onClick={onClose}>
      <div className={`med-modal ${fullscreen ? 'med-modal--fullscreen' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="med-modal__head">
          <h2>{item.name}</h2>
          <div className="med-row-actions">
            <button type="button" className="med-icon-btn" onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} title="Zoom in"><ZoomIn size={16} /></button>
            <button type="button" className="med-icon-btn" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} title="Zoom out"><ZoomOut size={16} /></button>
            <button type="button" className="med-icon-btn" onClick={() => setRotation((r) => r + 90)} title="Rotate"><RotateCw size={16} /></button>
            <button type="button" className="med-icon-btn" onClick={() => setFullscreen((f) => !f)} title="Fullscreen"><Maximize2 size={16} /></button>
            <button type="button" className="med-icon-btn" onClick={onClose}><X size={16} /></button>
          </div>
        </div>
        <div className="med-modal__preview">
          {item.category === 'image' ? (
            <img src={url} alt={item.name} style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }} />
          ) : (
            <p style={{ color: '#fff' }}>Preview not available for {item.category} files</p>
          )}
        </div>
        <div className="med-drawer__actions" style={{ marginTop: 16 }}>
          <button type="button" className="med-btn med-btn--ghost" onClick={handleDownload}><Download size={16} /> Download</button>
          <button type="button" className="med-btn med-btn--ghost" onClick={handleCopy}><Copy size={16} /> Copy URL</button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="med-btn med-btn--ghost"><ExternalLink size={16} /> Open original</a>
        </div>
      </div>
    </div>
  )
}

export function ImageEditorPanel({ item, open, onClose, onSave }) {
  const canvasRef = useRef(null)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !item?.url) return undefined
    const draw = async () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const rad = (rotation * Math.PI) / 180
        const w = rotation % 180 === 0 ? img.width : img.height
        const h = rotation % 180 === 0 ? img.height : img.width
        canvas.width = Math.min(w, 1200)
        canvas.height = Math.min(h, 1200)
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(rad)
        ctx.scale(flipH ? -1 : 1, 1)
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
        ctx.drawImage(img, (-img.width * scale) / 2, (-img.height * scale) / 2, img.width * scale, img.height * scale)
      }
      img.src = item.previewUrl || item.url
    }
    draw()
  }, [open, item, rotation, flipH, brightness, contrast])

  const handleSave = async () => {
    setSaving(true)
    try {
      const canvas = canvasRef.current
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
      await onSave?.(blob, item)
    } finally {
      setSaving(false)
    }
  }

  if (!open || !item) return null

  return (
    <div className="med-modal-backdrop" onClick={onClose}>
      <div className="med-modal med-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="med-modal__head">
          <h2>Image Editor</h2>
          <button type="button" className="med-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <p className="med-todo-hint">Crop, blur, sharpen, WebP conversion: TODO. Save re-uploads via POST /uploads/photo.</p>
        <div className="med-editor">
          <canvas ref={canvasRef} />
          <div className="med-editor__controls">
            <label>Rotate <input type="range" min={0} max={360} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} /></label>
            <label>Brightness <input type="range" min={50} max={150} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} /></label>
            <label>Contrast <input type="range" min={50} max={150} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} /></label>
            <button type="button" className="med-btn med-btn--ghost" onClick={() => setFlipH((f) => !f)}>Flip H</button>
            <button type="button" className="med-btn med-btn--ghost" onClick={() => { setRotation(0); setFlipH(false); setBrightness(100); setContrast(100) }}>Reset</button>
          </div>
          <div className="med-drawer__actions">
            <button type="button" className="med-btn med-btn--primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Uploading…' : 'Apply & re-upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
