import { GOOGLE_FONTS } from '../constants'

export function TextEditorPanel({ textLayer, onChange, onAdd, onRemove }) {
  if (!textLayer) {
    return (
      <div className="personalizer-panel">
        <h4>Typography</h4>
        <p className="personalizer-panel__hint">Add text to your design</p>
        <button type="button" className="personalizer-btn personalizer-btn--primary" onClick={onAdd}>
          + Add Text
        </button>
      </div>
    )
  }

  return (
    <div className="personalizer-panel">
      <div className="personalizer-panel__head">
        <h4>Typography</h4>
        <button type="button" className="personalizer-btn personalizer-btn--ghost" onClick={onRemove}>Remove</button>
      </div>
      <label>
        Text
        <textarea rows={2} value={textLayer.text} onChange={(e) => onChange({ text: e.target.value })} />
      </label>
      <label>
        Font
        <select value={textLayer.fontFamily} onChange={(e) => onChange({ fontFamily: e.target.value })}>
          {GOOGLE_FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </label>
      <label>
        Size
        <input type="range" min="12" max="120" value={textLayer.fontSize} onChange={(e) => onChange({ fontSize: Number(e.target.value) })} />
        <span>{textLayer.fontSize}px</span>
      </label>
      <div className="personalizer-panel__row">
        <button type="button" className={textLayer.fontWeight === '700' ? 'is-active' : ''} onClick={() => onChange({ fontWeight: textLayer.fontWeight === '700' ? '600' : '700' })}>B</button>
        <button type="button" className={textLayer.fontStyle === 'italic' ? 'is-active' : ''} onClick={() => onChange({ fontStyle: textLayer.fontStyle === 'italic' ? 'normal' : 'italic' })}>I</button>
        <button type="button" className={textLayer.underline ? 'is-active' : ''} onClick={() => onChange({ underline: !textLayer.underline })}>U</button>
      </div>
      <label>
        Color
        <input type="color" value={textLayer.fill} onChange={(e) => onChange({ fill: e.target.value })} />
      </label>
      <label>
        Letter spacing
        <input type="range" min="-5" max="20" value={textLayer.letterSpacing} onChange={(e) => onChange({ letterSpacing: Number(e.target.value) })} />
      </label>
      <label>
        Rotation
        <input type="range" min="-180" max="180" value={textLayer.rotation} onChange={(e) => onChange({ rotation: Number(e.target.value) })} />
      </label>
      <label>
        Opacity
        <input type="range" min="0" max="1" step="0.05" value={textLayer.opacity} onChange={(e) => onChange({ opacity: Number(e.target.value) })} />
      </label>
      <label>
        Stroke
        <input type="color" value={textLayer.stroke || '#000000'} onChange={(e) => onChange({ stroke: e.target.value, strokeWidth: textLayer.strokeWidth || 2 })} />
      </label>
    </div>
  )
}

export function BackgroundPanel({ background, onChange }) {
  const bg = background || {}
  return (
    <div className="personalizer-panel">
      <h4>Background</h4>
      <div className="personalizer-panel__tabs">
        {['solid', 'gradient', 'transparent', 'image'].map((t) => (
          <button key={t} type="button" className={bg.type === t ? 'is-active' : ''} onClick={() => onChange({ type: t })}>
            {t}
          </button>
        ))}
      </div>
      {bg.type === 'solid' && (
        <label>Color <input type="color" value={bg.color || '#f3f4f6'} onChange={(e) => onChange({ color: e.target.value })} /></label>
      )}
      {bg.type === 'gradient' && (
        <>
          <label>Start <input type="color" value={bg.color || '#f3f4f6'} onChange={(e) => onChange({ color: e.target.value })} /></label>
          <label>End <input type="color" value={bg.color2 || '#e5e7eb'} onChange={(e) => onChange({ color2: e.target.value })} /></label>
        </>
      )}
      {bg.type === 'image' && (
        <label>
          Image URL
          <input type="url" placeholder="https://..." value={bg.imageUrl || ''} onChange={(e) => onChange({ imageUrl: e.target.value })} />
        </label>
      )}
    </div>
  )
}

export function ClipArtPanel({ onAddClipart }) {
  const shapes = [
    { label: 'Heart', src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>') },
    { label: 'Star', src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>') },
  ]

  return (
    <div className="personalizer-panel">
      <h4>Clipart & Icons</h4>
      <p className="personalizer-panel__hint">SVG / PNG shapes — QR & custom logos: TODO upload API</p>
      <div className="personalizer-clipart-grid">
        {shapes.map((s) => (
          <button key={s.label} type="button" onClick={() => onAddClipart(s.src)} title={s.label}>
            <img src={s.src} alt={s.label} />
          </button>
        ))}
      </div>
    </div>
  )
}
