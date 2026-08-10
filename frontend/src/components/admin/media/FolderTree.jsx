import { FolderPlus, Folder, Trash2 } from 'lucide-react'
import { getFolderName } from '../../../utils/mediaAdminUtils'

export function FolderTree({ folders, currentFolder, onSelect, onCreate, onDelete }) {
  const handleCreate = () => {
    const name = window.prompt('Folder name')
    if (name?.trim()) onCreate(name.trim())
  }

  return (
    <aside className="med-sidebar">
      <h3>Folders</h3>
      <ul className="med-folder-tree">
        <li>
          <button
            type="button"
            className={`med-folder-item ${currentFolder === 'root' ? 'is-active' : ''}`}
            onClick={() => onSelect('root')}
          >
            <Folder size={16} /> All Files
          </button>
        </li>
        {folders
          .filter((f) => f.id !== 'root')
          .map((folder) => (
            <li key={folder.id}>
              <button
                type="button"
                className={`med-folder-item ${currentFolder === folder.id ? 'is-active' : ''}`}
                onClick={() => onSelect(folder.id)}
              >
                <Folder size={16} /> {folder.name}
              </button>
            </li>
          ))}
      </ul>
      <div className="med-folder-actions">
        <button type="button" className="med-btn med-btn--ghost med-btn--sm" onClick={handleCreate}>
          <FolderPlus size={14} /> New folder
        </button>
        {currentFolder !== 'root' ? (
          <button
            type="button"
            className="med-btn med-btn--ghost med-btn--sm"
            onClick={() => {
              if (window.confirm(`Delete folder "${getFolderName(folders, currentFolder)}"?`)) onDelete(currentFolder)
            }}
          >
            <Trash2 size={14} />
          </button>
        ) : null}
      </div>
      <p className="med-todo-hint" style={{ marginTop: 12 }}>
        Nested folders &amp; move folder: TODO — local metadata only until GET/POST /admin/media API.
      </p>
    </aside>
  )
}
