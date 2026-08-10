import { useState } from 'react'
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'

export function ProductSearchBar({ value, onChange }) {
  return (
    <label className="prod-search" htmlFor="product-global-search">
      <Search size={18} aria-hidden="true" />
      <input
        id="product-global-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search name, SKU, category, brand, tags…"
        aria-label="Search products"
      />
    </label>
  )
}

export function ProductFilters({ filters, onChange, categories, brands }) {
  const [open, setOpen] = useState(false)
  const subcategories = categories.filter((c) => c.parent)
  const topCategories = categories.filter((c) => !c.parent)

  return (
    <div className={`prod-filters ${open ? 'is-open' : ''}`}>
      <button type="button" className="prod-filters__toggle" onClick={() => setOpen((v) => !v)}>
        <SlidersHorizontal size={16} />
        <strong>Filters</strong>
        <ChevronDown size={16} className="prod-filters__chevron" aria-hidden="true" />
      </button>
      <div className="prod-filters__body">
      <div className="prod-filters__grid">
        <label>
          Source
          <select value={filters.catalogSource || ''} onChange={(e) => onChange({ ...filters, catalogSource: e.target.value })}>
            <option value="">All products</option>
            <option value="database">Database only</option>
            <option value="demo">Website demos only</option>
          </select>
        </label>
        <label>
          Category
          <select value={filters.category} onChange={(e) => onChange({ ...filters, category: e.target.value, subcategory: '' })}>
            <option value="">All</option>
            {topCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </label>
        <label>
          Subcategory
          <select value={filters.subcategory} onChange={(e) => onChange({ ...filters, subcategory: e.target.value })}>
            <option value="">All</option>
            {subcategories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </label>
        <label>
          Brand
          <select value={filters.brand} onChange={(e) => onChange({ ...filters, brand: e.target.value })}>
            <option value="">All</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </label>
        <label>
          Stock
          <select value={filters.stockStatus} onChange={(e) => onChange({ ...filters, stockStatus: e.target.value })}>
            <option value="">All</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </label>
        <label>
          Status
          <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        <label>
          Featured
          <select value={filters.featured} onChange={(e) => onChange({ ...filters, featured: e.target.value })}>
            <option value="">All</option>
            <option value="yes">Featured</option>
            <option value="no">Not featured</option>
          </select>
        </label>
        <label>
          Min price
          <input type="number" min="0" value={filters.priceMin} onChange={(e) => onChange({ ...filters, priceMin: e.target.value })} />
        </label>
        <label>
          Max price
          <input type="number" min="0" value={filters.priceMax} onChange={(e) => onChange({ ...filters, priceMax: e.target.value })} />
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
