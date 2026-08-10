import { useRef } from 'react'
import { Trash2, Upload } from 'lucide-react'

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp'

export function ThumbnailUploader({ thumbnail, onUpload, onRemove, uploading }) {
  const inputRef = useRef(null)

  const handleFile = async (fileList) => {
    const file = Array.from(fileList || []).find(
      (f) => ACCEPT.includes(f.type) || f.type.startsWith('image/'),
    )
    if (file) await onUpload(file)
  }

  return (
    <div className="peditor-thumbnail">
      <div className="peditor-thumbnail__head">
        <div>
          <strong>Home page thumbnail</strong>
          <p className="peditor-hint">
            Ye image home page aur product listing par dikhegi. Product open karne par mockup frame use hoga.
          </p>
        </div>
      </div>

      {thumbnail ? (
        <div className="peditor-thumbnail__preview">
          <img src={thumbnail} alt="Product thumbnail" />
          <div className="peditor-thumbnail__actions">
            <button
              type="button"
              className="prod-btn prod-btn--ghost"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Replace
            </button>
            <button type="button" className="prod-btn prod-btn--ghost" onClick={onRemove} disabled={uploading}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className="peditor-thumbnail__dropzone"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <Upload size={24} />
          <p>{uploading ? 'Uploading…' : 'Upload thumbnail (JPG, PNG, WEBP)'}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          handleFile(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
