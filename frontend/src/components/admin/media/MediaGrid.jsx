import { FileImage, FileText, Film, Music } from 'lucide-react'
import { formatBytes, formatResolution, getFolderName } from '../../../utils/mediaAdminUtils'
import { formatCustomerDate } from '../../../utils/customerAdminUtils'

function TypeBadge({ category }) {
  return <span className={`med-type-badge med-type-badge--${category}`}>{category}</span>
}

function Thumb({ item }) {
  if (item.category === 'image') {
    return (
      <img src={item.previewUrl || item.url} alt="" loading="lazy" className="med-thumb" />
    )
  }
  const Icon = item.category === 'video' ? Film : item.category === 'audio' ? Music : FileText
  return (
    <span className="med-thumb med-thumb--icon">
      <Icon size={20} />
      {item.extension?.toUpperCase()}
    </span>
  )
}

export function MediaGridSkeleton() {
  return <div className="med-skeleton med-skeleton--grid" />
}

export function MediaGrid({ items, selected, onToggleSelect, onOpen, viewMode = 'grid', folders }) {
  if (!items.length) {
    return (
      <div className="med-empty">
        <FileImage size={32} />
        <p>No files in this folder</p>
      </div>
    )
  }

  return (
    <div className={`med-grid ${viewMode === 'compact' ? 'med-grid--compact' : ''}`}>
      {items.map((item) => (
        <article
          key={item.id}
          className={`med-grid-item ${selected.includes(item.id) ? 'is-selected' : ''}`}
          onClick={() => onOpen(item)}
          onKeyDown={(e) => e.key === 'Enter' && onOpen(item)}
          role="button"
          tabIndex={0}
        >
          <label className="med-grid-item__check" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggleSelect(item.id)} />
          </label>
          <div className="med-grid-item__thumb">
            {item.category === 'image' ? (
              <img src={item.previewUrl || item.url} alt="" loading="lazy" />
            ) : (
              <div className="med-grid-item__thumb--doc">{item.extension?.toUpperCase() || 'FILE'}</div>
            )}
          </div>
          <div className="med-grid-item__meta">
            <strong title={item.name}>{item.name}</strong>
            <span>{formatBytes(item.sizeBytes)} · {getFolderName(folders, item.folderId)}</span>
          </div>
        </article>
      ))}
    </div>
  )
}

export function MediaTable({
  items,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  visibleColumns,
  sortKey,
  sortDir,
  onSort,
  onOpen,
  folders,
}) {
  const show = (col) => visibleColumns.includes(col)
  const SortBtn = ({ col, label }) => (
    <button type="button" className="med-sort-btn" onClick={() => onSort(col)}>
      {label} {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  )

  if (!items.length) {
    return (
      <div className="med-empty">
        <FileImage size={32} />
        <p>No files match your filters</p>
      </div>
    )
  }

  return (
    <div className="med-table-wrap">
      <table className="med-table">
        <thead>
          <tr>
            <th><input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} aria-label="Select all" /></th>
            {show('preview') && <th>Preview</th>}
            {show('name') && <th><SortBtn col="name" label="File Name" /></th>}
            {show('type') && <th>Type</th>}
            {show('size') && <th><SortBtn col="size" label="Size" /></th>}
            {show('resolution') && <th>Resolution</th>}
            {show('folder') && <th>Folder</th>}
            {show('uploadedBy') && <th>Uploaded By</th>}
            {show('created') && <th><SortBtn col="createdAt" label="Created" /></th>}
            {show('modified') && <th>Modified</th>}
            {show('storage') && <th>Storage</th>}
            {show('actions') && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="med-table__row">
              <td><input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggleSelect(item.id)} /></td>
              {show('preview') && (
                <td>
                  <button type="button" className="med-icon-btn" onClick={() => onOpen(item)} style={{ padding: 0, border: 0 }}>
                    <Thumb item={item} />
                  </button>
                </td>
              )}
              {show('name') && (
                <td>
                  <button type="button" className="med-btn med-btn--ghost med-btn--sm" onClick={() => onOpen(item)} style={{ border: 0, padding: 0, minHeight: 0 }}>
                    <strong>{item.name}</strong>
                  </button>
                  {item.locked ? <small style={{ display: 'block', color: 'var(--admin-text-muted)' }}>In use</small> : null}
                </td>
              )}
              {show('type') && <td><TypeBadge category={item.category} /></td>}
              {show('size') && <td>{formatBytes(item.sizeBytes)}</td>}
              {show('resolution') && <td>{formatResolution(item.width, item.height)}</td>}
              {show('folder') && <td>{getFolderName(folders, item.folderId)}</td>}
              {show('uploadedBy') && <td>{item.uploadedBy}</td>}
              {show('created') && <td>{formatCustomerDate(item.createdAt)}</td>}
              {show('modified') && <td>{formatCustomerDate(item.updatedAt)}</td>}
              {show('storage') && <td>{item.storage}</td>}
              {show('actions') && (
                <td>
                  <button type="button" className="med-btn med-btn--ghost med-btn--sm" onClick={() => onOpen(item)}>View</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
