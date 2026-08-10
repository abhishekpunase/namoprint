const ranges = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
  { id: 'custom', label: 'Custom' },
]

export function DashboardFilters({ range, onRangeChange, customRange, onCustomRangeChange }) {
  return (
    <div className="dash-filters" role="toolbar" aria-label="Date filters">
      <div className="dash-filters__pills">
        {ranges.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`dash-filter-pill ${range === item.id ? 'is-active' : ''}`}
            onClick={() => onRangeChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {range === 'custom' ? (
        <div className="dash-filters__custom">
          <label>
            From
            <input
              type="date"
              value={customRange.from}
              onChange={(event) => onCustomRangeChange({ ...customRange, from: event.target.value })}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={customRange.to}
              onChange={(event) => onCustomRangeChange({ ...customRange, to: event.target.value })}
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
