import { useEffect, useRef, useState } from 'react'
import { FlipHorizontal, RotateCw, Save, Sun, X } from 'lucide-react'

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export function ImageEditorModal({ imageUrl, onClose, onSave }) {
  const canvasRef = useRef(null)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const draw = async () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const img = await loadImage(imageUrl)
      const rad = (rotation * Math.PI) / 180
      const w = rotation % 180 === 0 ? img.width : img.height
      const h = rotation % 180 === 0 ? img.height : img.width
      canvas.width = w
      canvas.height = h
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
      ctx.translate(w / 2, h / 2)
      ctx.rotate(rad)
      ctx.scale(flipH ? -1 : 1, 1)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
    }
    draw().catch(() => {})
  }, [imageUrl, rotation, flipH, brightness, contrast])

  const handleSave = async () => {
    setSaving(true)
    try {
      const canvas = canvasRef.current
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
      await onSave(blob)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="peditor-modal-root" role="dialog" aria-modal="true">
      <button type="button" className="peditor-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="peditor-modal peditor-modal--wide">
        <header className="peditor-modal__head">
          <h3>Image editor</h3>
          <button type="button" className="prod-icon-btn" onClick={onClose}><X size={16} /></button>
        </header>
        <div className="peditor-editor-layout">
          <canvas ref={canvasRef} className="peditor-editor-canvas" />
          <div className="peditor-editor-controls">
            <label>
              <RotateCw size={14} /> Rotate {rotation}°
              <input type="range" min="0" max="270" step="90" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} />
            </label>
            <button type="button" className="prod-btn prod-btn--ghost" onClick={() => setFlipH((v) => !v)}>
              <FlipHorizontal size={14} /> Flip horizontal
            </button>
            <label>
              <Sun size={14} /> Brightness
              <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
            </label>
            <label>
              Contrast
              <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
            </label>
            <p className="prod-todo">Background removal: TODO when API available</p>
          </div>
        </div>
        <footer className="peditor-modal__foot">
          <button type="button" className="prod-btn prod-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="prod-btn prod-btn--primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Apply & upload'}
          </button>
        </footer>
      </div>
    </div>
  )
}
