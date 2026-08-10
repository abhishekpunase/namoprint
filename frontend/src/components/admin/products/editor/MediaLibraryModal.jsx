import { ImageIcon, Home, Layers, X } from 'lucide-react'

export function MediaLibraryModal({ images = [], frameImage, thumbnail, onClose, onSelect, onUseAsFrame, onUseAsThumbnail }) {
  const all = [...new Set([thumbnail, ...images, frameImage].filter(Boolean))]

  return (
    <div className="peditor-modal-root" role="dialog" aria-modal="true">
      <button type="button" className="peditor-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="peditor-modal peditor-modal--wide">
        <header className="peditor-modal__head">
          <h3><ImageIcon size={18} /> Media library</h3>
          <button type="button" className="prod-icon-btn" onClick={onClose}><X size={16} /></button>
        </header>
        <p className="peditor-hint">
          Add to gallery, set as home thumbnail, or use as mockup frame for the product page.
        </p>
        {!all.length ? (
          <p className="peditor-empty">No media yet — upload images in the Images section.</p>
        ) : (
          <div className="peditor-media-grid">
            {all.map((url) => (
              <div key={url} className="peditor-media-item-wrap">
                <button type="button" className="peditor-media-item" onClick={() => { onSelect(url); onClose() }}>
                  <img src={url} alt="" />
                </button>
                {onUseAsThumbnail && (
                  <button
                    type="button"
                    className="peditor-media-frame-btn"
                    onClick={() => { onUseAsThumbnail(url); onClose() }}
                    title="Use as home page thumbnail"
                  >
                    <Home size={14} /> Thumbnail
                  </button>
                )}
                {onUseAsFrame && (
                  <button
                    type="button"
                    className="peditor-media-frame-btn"
                    onClick={() => { onUseAsFrame(url); onClose() }}
                    title="Use as mockup frame with auto-detect"
                  >
                    <Layers size={14} /> Mockup frame
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
