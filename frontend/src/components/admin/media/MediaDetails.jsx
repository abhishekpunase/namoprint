import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Download, Edit3, Trash2, X } from 'lucide-react'
import {
  aspectRatio,
  copyToClipboard,
  formatBytes,
  formatResolution,
  getFolderName,
} from '../../../utils/mediaAdminUtils'
import { formatCustomerDate } from '../../../utils/customerAdminUtils'

export function MediaDetailsDrawer({
  item,
  folders,
  onClose,
  onRename,
  onDelete,
  onEdit,
  onDownload,
  onTagsChange,
}) {
  const [tagInput, setTagInput] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState('')

  if (!item) return null

  const startRename = () => {
    setName(item.name)
    setRenaming(true)
  }

  const saveRename = () => {
    if (name.trim()) onRename?.(item.id, name.trim())
    setRenaming(false)
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (!tag) return
    const tags = [...new Set([...(item.tags || []), tag])]
    onTagsChange?.(item.id, tags)
    setTagInput('')
  }

  const removeTag = (tag) => {
    onTagsChange?.(item.id, (item.tags || []).filter((t) => t !== tag))
  }

  const copyUrl = async () => {
    await copyToClipboard(item.url)
  }

  const usageLink = (usage) => {
    if (usage.type === 'product') return `/admin/products/${usage.id}/edit`
    if (usage.type === 'category') return `/admin/categories/${usage.id}`
    return null
  }

  return (
    <>
      <button type="button" className="med-drawer-backdrop" aria-label="Close" onClick={onClose} />
      <aside className="med-drawer">
        <div className="med-drawer__head">
          <div>
            <h2>{item.name}</h2>
            <span className={`med-type-badge med-type-badge--${item.category}`}>{item.category}</span>
          </div>
          <button type="button" className="med-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {item.category === 'image' ? (
          <div className="med-drawer__preview">
            <img src={item.previewUrl || item.url} alt={item.name} />
          </div>
        ) : null}

        <div className="med-drawer__actions">
          <button type="button" className="med-btn med-btn--ghost" onClick={() => onDownload?.(item)}><Download size={16} /> Download</button>
          <button type="button" className="med-btn med-btn--ghost" onClick={copyUrl}><Copy size={16} /> Copy URL</button>
          {item.category === 'image' ? (
            <button type="button" className="med-btn med-btn--ghost" onClick={() => onEdit?.(item)}><Edit3 size={16} /> Edit</button>
          ) : null}
          {!item.locked ? (
            <button type="button" className="med-btn med-btn--ghost" onClick={() => onDelete?.(item.id)}><Trash2 size={16} /> Delete</button>
          ) : null}
        </div>

        {item.locked ? (
          <p className="med-message med-message--warn">This file is linked to catalog data and cannot be removed from storage here.</p>
        ) : null}

        <dl>
          <dt>Original name</dt><dd>{item.originalName}</dd>
          <dt>File size</dt><dd>{formatBytes(item.sizeBytes)}</dd>
          <dt>Resolution</dt><dd>{formatResolution(item.width, item.height)}</dd>
          <dt>Aspect ratio</dt><dd>{aspectRatio(item.width, item.height)}</dd>
          <dt>Extension</dt><dd>{item.extension || '—'}</dd>
          <dt>Uploaded by</dt><dd>{item.uploadedBy}</dd>
          <dt>Upload date</dt><dd>{formatCustomerDate(item.createdAt)}</dd>
          <dt>Last modified</dt><dd>{formatCustomerDate(item.updatedAt)}</dd>
          <dt>Storage</dt><dd>{item.storage}</dd>
          <dt>Folder</dt><dd>{getFolderName(folders, item.folderId)}</dd>
          <dt>Usage count</dt><dd>{item.usageCount || 0}</dd>
        </dl>

        <h3>Tags</h3>
        <div className="med-tags" style={{ marginBottom: 8 }}>
          {(item.tags || []).map((tag) => (
            <span key={tag} className="med-tag">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" onKeyDown={(e) => e.key === 'Enter' && addTag()} />
          <button type="button" className="med-btn med-btn--ghost med-btn--sm" onClick={addTag}>Add</button>
        </div>

        <h3>Used in</h3>
        {(item.usages || []).length ? (
          <ul className="med-usage-list">
            {item.usages.map((u) => {
              const to = usageLink(u)
              return (
                <li key={`${u.type}-${u.id}-${u.field}`}>
                  {to ? <Link to={to}>{u.title}</Link> : u.title} — {u.label}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="med-todo-hint">Not referenced in products or categories yet</p>
        )}

        <h3 style={{ marginTop: 16 }}>Rename</h3>
        {renaming ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button type="button" className="med-btn med-btn--primary med-btn--sm" onClick={saveRename}>Save</button>
          </div>
        ) : (
          <button type="button" className="med-btn med-btn--ghost med-btn--sm" onClick={startRename}>Rename file</button>
        )}
      </aside>
    </>
  )
}

export function MediaAnalyticsPanel({ analytics }) {
  if (!analytics) return null
  return (
    <section className="med-panel">
      <h2>Media Analytics</h2>
      <div className="med-analytics-grid">
        <div>
          <h3>Largest Files</h3>
          <ul>
            {analytics.bySize.map((i) => (
              <li key={i.id}>{i.name} — {formatBytes(i.sizeBytes)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Most Used</h3>
          <ul>
            {analytics.byUsage.map((i) => (
              <li key={i.id}>{i.name} — {i.usageCount} refs</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Recent Uploads</h3>
          <ul>
            {analytics.recent.map((i) => (
              <li key={i.id}>{i.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Most Downloaded</h3>
          <ul>
            {analytics.mostDownloaded.map((i) => (
              <li key={i.id}>{i.name} — {i.downloads} downloads</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function MediaActivityPanel({ activity }) {
  return (
    <section className="med-panel">
      <h2>Recent Activity</h2>
      {!activity?.length ? (
        <p className="med-todo-hint">No activity yet</p>
      ) : (
        <ul className="med-timeline">
          {activity.slice(0, 15).map((entry) => (
            <li key={entry.id}>
              <strong>{entry.action}</strong>
              {entry.detail ? ` — ${entry.detail}` : ''}
              <time>{formatCustomerDate(entry.timestamp)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
