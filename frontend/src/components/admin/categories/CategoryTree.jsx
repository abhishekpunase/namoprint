import { useState } from 'react'
import { ChevronDown, ChevronRight, Edit2, Eye, GripVertical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CategoryStatusBadge, CategoryEmptyState } from './CategoryStatusBadge'

function TreeNode({
  node,
  depth,
  expandedIds,
  onToggleExpanded,
  countProducts,
  onReorder,
  dragState,
  setDragState,
}) {
  const hasChildren = node.children?.length > 0
  const expanded = expandedIds.has(node._id)

  const handleDragStart = (e) => {
    setDragState({ id: node._id, parent: node.parent?._id || node.parent || '' })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetParentId = null) => {
    e.preventDefault()
    e.stopPropagation()
    if (!dragState?.id || dragState.id === node._id) return
    onReorder?.(dragState.id, {
      parent: targetParentId || node._id,
      sortOrder: node.sortOrder ?? 0,
    })
    setDragState(null)
  }

  const handleDropOnRoot = (e) => {
    e.preventDefault()
    if (!dragState?.id) return
    onReorder?.(dragState.id, { parent: undefined, sortOrder: node.sortOrder ?? 0 })
    setDragState(null)
  }

  return (
    <div className="cat-tree-node" style={{ '--cat-depth': depth }}>
      <div
        className="cat-tree-node__row"
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, node.parent?._id || node.parent || undefined)}
      >
        <span className="cat-tree-node__indent" aria-hidden="true" />
        {hasChildren ? (
          <button type="button" className="cat-tree-node__toggle" onClick={() => onToggleExpanded(node._id)} aria-expanded={expanded}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="cat-tree-node__spacer" />
        )}
        <GripVertical size={14} className="cat-drag-handle" aria-hidden="true" />
        <div className="cat-thumb cat-thumb--sm">
          {node.imageUrl ? <img src={node.imageUrl} alt="" /> : <span>{node.name?.slice(0, 1)}</span>}
        </div>
        <div className="cat-tree-node__info">
          <Link to={`/admin/categories/${node._id}`}>{node.name}</Link>
          <small>{countProducts(node._id)} products · order {node.sortOrder ?? 0}</small>
        </div>
        <CategoryStatusBadge category={node} />
        <div className="cat-tree-node__actions">
          <Link to={`/admin/categories/${node._id}`} className="cat-icon-btn" title="View"><Eye size={14} /></Link>
          <Link to={`/admin/categories/${node._id}/edit`} className="cat-icon-btn" title="Edit"><Edit2 size={14} /></Link>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="cat-tree-node__children">
          {node.children.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpanded={onToggleExpanded}
              countProducts={countProducts}
              onReorder={onReorder}
              dragState={dragState}
              setDragState={setDragState}
            />
          ))}
        </div>
      )}
      {!hasChildren && (
        <div
          className="cat-tree-drop-zone"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, node._id)}
        >
          Drop here to nest under {node.name}
        </div>
      )}
    </div>
  )
}

export function CategoryTree({
  tree,
  loading,
  expandedIds,
  onToggleExpanded,
  countProducts,
  onReorder,
  hasFilters,
  onClearFilters,
  onCreate,
}) {
  const [dragState, setDragState] = useState(null)

  if (loading) {
    return <div className="cat-tree-loader">Loading category tree…</div>
  }

  if (!tree.length) {
    return <CategoryEmptyState hasFilters={hasFilters} onClear={onClearFilters} onCreate={onCreate} />
  }

  const handleRootDrop = (e) => {
    e.preventDefault()
    if (!dragState?.id) return
    onReorder?.(dragState.id, { parent: undefined, sortOrder: 999 })
    setDragState(null)
  }

  return (
    <div className="cat-tree" onDragOver={(e) => e.preventDefault()} onDrop={handleRootDrop}>
      <p className="cat-tree__hint">Drag categories to reorder or change parent. Updates sort order via existing API.</p>
      {tree.map((node) => (
        <TreeNode
          key={node._id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          onToggleExpanded={onToggleExpanded}
          countProducts={countProducts}
          onReorder={onReorder}
          dragState={dragState}
          setDragState={setDragState}
        />
      ))}
    </div>
  )
}
