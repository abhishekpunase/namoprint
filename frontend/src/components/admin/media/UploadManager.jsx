import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw, Upload, X } from 'lucide-react'
import { api } from '../../../services/api'
import { IMAGE_ACCEPT } from '../../../utils/mediaAdminUtils'

export function UploadManager({ open, onClose, onUploaded, folderId }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [queue, setQueue] = useState([])

  useEffect(() => {
    if (!open) setQueue([])
  }, [open])

  const processFile = useCallback(
    async (item) => {
      setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, status: 'uploading', progress: 20 } : x)))
      try {
        setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, progress: 60 } : x)))
        const payload = await api.uploadPhoto(item.file)
        const asset = payload.asset
        onUploaded?.(asset, { folderId, uploadedBy: 'Admin' })
        setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, status: 'done', progress: 100 } : x)))
      } catch (err) {
        setQueue((q) =>
          q.map((x) => (x.id === item.id ? { ...x, status: 'error', error: err.message, progress: 0 } : x)),
        )
      }
    },
    [folderId, onUploaded],
  )

  const enqueue = useCallback(
    async (files) => {
      const items = Array.from(files || []).filter(
        (f) => f.type.startsWith('image/') || IMAGE_ACCEPT.includes(f.type),
      )
      if (!items.length) return
      const mapped = items.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        status: 'pending',
        progress: 0,
      }))
      setQueue((q) => [...q, ...mapped])
      for (const item of mapped) {
        await processFile(item)
      }
    },
    [processFile],
  )

  const handleFiles = (fileList) => enqueue(fileList)

  useEffect(() => {
    if (!open) return undefined
    const onPaste = (e) => {
      if (e.clipboardData?.files?.length) {
        e.preventDefault()
        handleFiles(e.clipboardData.files)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [open, handleFiles])

  const retry = (id) => {
    const item = queue.find((x) => x.id === id)
    if (item) processFile(item)
  }

  if (!open) return null

  return (
    <div className="med-modal-backdrop" onClick={onClose}>
      <div className="med-modal" onClick={(e) => e.stopPropagation()}>
        <div className="med-modal__head">
          <h2>Upload Manager</h2>
          <button type="button" className="med-icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <p className="med-todo-hint">
          Uses <code>POST /uploads/photo</code> — images only (PNG, JPG, WEBP, SVG, HEIC). Video/document upload: TODO backend support.
        </p>
        <div
          className={`med-dropzone ${dragOver ? 'is-dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        >
          <Upload size={32} />
          <p>Drag &amp; drop, click, or paste images</p>
          <button type="button" className="med-btn med-btn--primary" onClick={() => inputRef.current?.click()}>Choose files</button>
          <button type="button" className="med-btn med-btn--ghost" disabled title="TODO: webkitdirectory + backend batch API">Folder upload (TODO)</button>
          <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} multiple hidden onChange={(e) => handleFiles(e.target.files)} />
        </div>
        {queue.length > 0 ? (
          <div className="med-upload-queue">
            {queue.map((item) => (
              <div key={item.id} className={`med-upload-item is-${item.status}`}>
                <span>{item.file.name}</span>
                {item.status === 'error' ? (
                  <button type="button" className="med-btn med-btn--ghost med-btn--sm" onClick={() => retry(item.id)}>
                    <RefreshCw size={14} /> Retry
                  </button>
                ) : null}
                {item.status !== 'uploading' ? (
                  <button type="button" className="med-icon-btn" onClick={() => setQueue((q) => q.filter((x) => x.id !== item.id))}>
                    <X size={14} />
                  </button>
                ) : null}
                <div className="med-upload-item__bar"><span style={{ width: `${item.progress}%` }} /></div>
                {item.error ? <span style={{ gridColumn: '1 / -1', color: '#b91c1c' }}>{item.error}</span> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
