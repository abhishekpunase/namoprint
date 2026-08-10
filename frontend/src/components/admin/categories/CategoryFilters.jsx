import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function CategorySearchBar({ value, onChange }) {
  return (
    <label className="cat-search" htmlFor="category-global-search">
      <Search size={18} aria-hidden="true" />
      <input
        id="category-global-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search name, slug, parent, description…"
        aria-label="Search categories"
      />
    </label>
  )
}

export function CategoryFilters({ filters, onChange, parentCategories }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`cat-filters ${open ? 'is-open' : ''}`}>
      <button type="button" className="cat-filters__toggle" onClick={() => setOpen((v) => !v)}>
        <SlidersHorizontal size={16} />
        <strong>Filters</strong>
        <ChevronDown size={16} className="cat-filters__chevron" aria-hidden="true" />
      </button>
      <div className="cat-filters__body">
        <div className="cat-filters__grid">
          <label>
            Status
            <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label>
            Parent
            <select value={filters.parent} onChange={(e) => onChange({ ...filters, parent: e.target.value })}>
              <option value="">All</option>
              {parentCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </label>
          <label>
            Products
            <select value={filters.productCount} onChange={(e) => onChange({ ...filters, productCount: e.target.value })}>
              <option value="">Any count</option>
              <option value="0">No products</option>
              <option value="1+">Has products</option>
              <option value="10+">10+ products</option>
            </select>
          </label>
          <label>
            Featured
            <select value={filters.featured} onChange={(e) => onChange({ ...filters, featured: e.target.value })} disabled title="TODO: featured flag not in API">
              <option value="">All</option>
              <option value="yes">Featured (TODO)</option>
            </select>
          </label>
          <label>
            From
            <input type="date" value={filters.dateFrom} onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })} />
          </label>
          <label>
            To
            <input type="date" value={filters.dateTo} onChange={(e) => onChange({ ...filters, dateTo: e.target.value })} />
          </label>
        </div>
      </div>
    </div>
  )
}
