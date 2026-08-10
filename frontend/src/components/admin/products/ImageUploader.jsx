import { useRef, useState } from 'react'
import { FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { motion } from 'framer-motion'

export function ImageUploader({ images, onUpload, onRemove, onReorder, uploading = false }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'].includes(f.type))
    if (!files.length) return
    await onUpload(files)
  }

  return (
    <div className="prod-image-uploader">
      <div
        className={`prod-dropzone ${dragOver ? 'is-dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        <FiUploadCloud size={28} />
        <p>Drag & drop PNG, JPG, WEBP or click to upload</p>
        <button type="button" className="prod-btn prod-btn--ghost" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Choose files'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <small className="prod-todo">Crop / rotate / zoom: TODO advanced editor</small>
      </div>

      {images.length ? (
        <div className="prod-image-grid">
          {images.map((url, index) => (
            <motion.div
              key={url + index}
              className="prod-image-item"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img src={url} alt="" />
              {index === 0 ? <span className="prod-image-item__badge">Primary</span> : null}
              <div className="prod-image-item__actions">
                {index > 0 ? (
                  <button type="button" onClick={() => onReorder(index, index - 1)} aria-label="Move left">
                    ←
                  </button>
                ) : null}
                {index < images.length - 1 ? (
                  <button type="button" onClick={() => onReorder(index, index + 1)} aria-label="Move right">
                    →
                  </button>
                ) : null}
                <button type="button" onClick={() => onRemove(index)} aria-label="Remove image">
                  <FiTrash2 />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="prod-panel-empty">No images uploaded yet.</p>
      )}
    </div>
  )
}
