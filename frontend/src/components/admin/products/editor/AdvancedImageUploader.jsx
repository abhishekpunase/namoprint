import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Copy,
  Crop,
  GripVertical,
  LayoutGrid,
  List,
  RefreshCw,
  RotateCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useImageUploadQueue } from '../../../../hooks/useProductEditor'
import { ImageEditorModal } from './ImageEditorModal'

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml'

export function AdvancedImageUploader({
  images,
  onUpload,
  onRemove,
  onReorder,
  onReplace,
  uploading,
}) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [view, setView] = useState('grid')
  const [editIndex, setEditIndex] = useState(null)
  const { queue, enqueue, retry, cancel, clearCompleted } = useImageUploadQueue(onUpload)

  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => ACCEPT.includes(f.type) || f.type.startsWith('image/'))
    if (!files.length) return
    await enqueue(files)
  }, [enqueue])

  useEffect(() => {
    const onPaste = (e) => {
      if (e.clipboardData?.files?.length) {
        e.preventDefault()
        handleFiles(e.clipboardData.files)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [handleFiles])

  const duplicateImage = (index) => {
    const url = images[index]
    if (url) onUpload([]) // no-op placeholder - duplicate URL in form
    onReorder(index, images.length) // move copy to end - actually need setForm
  }

  return (
    <div className="peditor-uploader">
      <div
        className={`peditor-dropzone ${dragOver ? 'is-dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
      >
        <Upload size={28} />
        <p>Drag & drop, click, or paste images (PNG, JPG, WEBP, SVG)</p>
        <button type="button" className="prod-btn prod-btn--ghost" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Choose files'}
        </button>
        <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => handleFiles(e.target.files)} />
        <small>Folder upload: TODO — browser directory picker</small>
      </div>

      {queue.length > 0 && (
        <div className="peditor-upload-queue">
          <div className="peditor-upload-queue__head">
            <strong>Upload queue</strong>
            <button type="button" className="prod-btn prod-btn--ghost" onClick={clearCompleted}>Clear done</button>
          </div>
          {queue.map((item) => (
            <div key={item.id} className={`peditor-upload-item is-${item.status}`}>
              <span>{item.file.name}</span>
              <div className="peditor-upload-item__bar"><span style={{ width: `${item.progress}%` }} /></div>
              {item.status === 'error' && (
                <button type="button" className="prod-btn prod-btn--ghost" onClick={() => retry(item.id)}>
                  <RefreshCw size={14} /> Retry
                </button>
              )}
              {item.status !== 'uploading' && (
                <button type="button" className="prod-icon-btn" onClick={() => cancel(item.id)} aria-label="Cancel">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="peditor-gallery-toolbar">
        <div className="peditor-view-toggle">
          <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')}><LayoutGrid size={16} /></button>
          <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}><List size={16} /></button>
        </div>
        <span>{images.length} image{images.length === 1 ? '' : 's'}</span>
      </div>

      {!images.length ? (
        <p className="peditor-empty">No images yet. Upload product gallery photos.</p>
      ) : (
        <div className={`peditor-gallery peditor-gallery--${view}`}>
          {images.map((url, index) => (
            <motion.div key={`${url}-${index}`} className="peditor-gallery__item" layout>
              <button type="button" className="peditor-gallery__drag" aria-label="Reorder"><GripVertical size={14} /></button>
              <img src={url} alt="" />
              {index === 0 && <span className="peditor-gallery__badge">Gallery</span>}
              <div className="peditor-gallery__actions">
                {index > 0 && (
                  <button type="button" onClick={() => onReorder(index, 0)} title="Set as primary">★</button>
                )}
                <button type="button" onClick={() => setEditIndex(index)} title="Edit"><Crop size={14} /></button>
                <button type="button" onClick={() => onRemove(index)} title="Delete"><Trash2 size={14} /></button>
                <button type="button" disabled title="Duplicate: TODO"><Copy size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {editIndex !== null && images[editIndex] && (
        <ImageEditorModal
          imageUrl={images[editIndex]}
          onClose={() => setEditIndex(null)}
          onSave={async (blob) => {
            if (onReplace) await onReplace(editIndex, blob)
            setEditIndex(null)
          }}
        />
      )}
    </div>
  )
}
