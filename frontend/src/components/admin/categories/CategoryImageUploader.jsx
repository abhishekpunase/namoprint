import { useState } from 'react'
import { Upload, X } from 'lucide-react'

export function CategoryImageUploader({ label, value, onChange, onUpload, uploading }) {
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = async (files) => {
    if (!files?.length || !onUpload) return
    const url = await onUpload(files[0])
    if (url) onChange(url)
  }

  return (
    <div className="cat-image-uploader">
      <p>{label}</p>
      {value ? (
        <div className="cat-image-uploader__preview">
          <img src={value} alt="" />
          <button type="button" className="cat-icon-btn" onClick={() => onChange('')} aria-label="Remove image">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label
          className={`cat-dropzone ${dragOver ? 'is-dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          <Upload size={24} />
          <span>{uploading ? 'Uploading…' : 'Drag & drop or click to upload'}</span>
          <small>PNG, JPG, WEBP</small>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}
      <p className="cat-todo">Crop / rotate / zoom: TODO advanced editor</p>
    </div>
  )
}
