import { Search } from 'lucide-react'

export function SearchBox({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
  id = 'admin-search',
  ariaLabel = 'Search',
}) {
  return (
    <label className={`admin-v2-search ${className}`.trim()} htmlFor={id}>
      <Search size={18} aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="admin-v2-search__input"
      />
    </label>
  )
}
