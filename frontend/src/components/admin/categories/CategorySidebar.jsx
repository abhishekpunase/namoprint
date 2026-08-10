import { Archive, FolderTree, Sparkles, Star, Clock } from 'lucide-react'
import { homeCategories } from '../../../data/fallbackCatalog'

const SIDEBAR_ITEMS = [
  { id: 'all', label: 'All Categories', icon: FolderTree },
  { id: 'parents', label: 'Parent Categories', icon: FolderTree },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'featured', label: 'Featured', icon: Star, todo: 'Uses sort order ≤ 3 until API flag exists' },
  { id: 'archived', label: 'Archived', icon: Archive },
]

export function CategorySidebar({ activeFilter, onFilterChange, totalCount }) {
  return (
    <aside className="cat-sidebar">
      <div className="cat-sidebar__section">
        <h3>Browse</h3>
        <nav className="cat-sidebar__nav">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className={`cat-sidebar__link ${activeFilter === item.id ? 'is-active' : ''}`}
                onClick={() => onFilterChange(item.id)}
                title={item.todo || undefined}
              >
                <Icon size={16} />
                {item.label}
                {item.id === 'all' && <span className="cat-sidebar__count">{totalCount}</span>}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="cat-sidebar__section">
        <h3>
          Homepage Sections <span className="cat-todo">Storefront</span>
        </h3>
        <ul className="cat-sidebar__home-list">
          {homeCategories.slice(0, 8).map((item) => (
            <li key={`${item.value}-${item.label}`}>
              <a href={`/category/${item.value}`} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="cat-sidebar__hint">
          <Sparkles size={14} /> Homepage tiles from catalog config — manage display order in category sort order.
        </p>
      </div>
    </aside>
  )
}

export function CategoryQuickActions({ onAdd, onExport, onImport, onManageOrder }) {
  return (
    <div className="cat-quick-actions">
      <button type="button" className="cat-btn cat-btn--primary" onClick={onAdd}>Add Category</button>
      <button type="button" className="cat-btn cat-btn--ghost" onClick={onExport}>Export</button>
      <button type="button" className="cat-btn cat-btn--ghost" onClick={onImport} disabled title="TODO: CSV import API">
        Import
      </button>
      <button type="button" className="cat-btn cat-btn--ghost" onClick={onManageOrder}>Manage Order</button>
    </div>
  )
}
