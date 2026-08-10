import { Search } from 'lucide-react'

const scopes = ['Orders', 'Products', 'Customers', 'Categories', 'Users']

export function DashboardSearch({ value, onChange }) {
  return (
    <div className="dash-search">
      <label className="dash-search__field" htmlFor="dashboard-global-search">
        <Search size={18} aria-hidden="true" />
        <input
          id="dashboard-global-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search orders, products, customers…"
          aria-label="Global dashboard search"
        />
      </label>
      <div className="dash-search__scopes" aria-label="Search scopes">
        {scopes.map((scope) => (
          <span key={scope} className="dash-search__scope">
            {scope}
          </span>
        ))}
      </div>
    </div>
  )
}
