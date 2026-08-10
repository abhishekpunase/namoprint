import { DATE_RANGES } from '../../../utils/analyticsAdminUtils'

export function AnalyticsSearchBar({ value, onChange }) {
  return (
    <div className="anl-search">
      <input
        placeholder="Search analytics, reports, metrics…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function AnalyticsFilters({ range, onRangeChange, customRange, onCustomRangeChange, compareMode, onCompareChange, onRefresh, refreshing }) {
  return (
    <div className="anl-filters">
      <label>
        Date Range
        <select value={range} onChange={(e) => onRangeChange(e.target.value)}>
          {DATE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </label>
      {range === 'custom' ? (
        <>
          <label>From<input type="date" value={customRange.from} onChange={(e) => onCustomRangeChange({ ...customRange, from: e.target.value })} /></label>
          <label>To<input type="date" value={customRange.to} onChange={(e) => onCustomRangeChange({ ...customRange, to: e.target.value })} /></label>
        </>
      ) : null}
      <label className="anl-filters__check">
        <input type="checkbox" checked={compareMode} onChange={(e) => onCompareChange(e.target.checked)} />
        Compare vs previous period
      </label>
      <button type="button" className="anl-btn anl-btn--ghost" onClick={onRefresh} disabled={refreshing}>Refresh</button>
    </div>
  )
}

export function AnalyticsTabs({ active, onChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reports', label: 'Report Center' },
    { id: 'builder', label: 'Custom Builder' },
    { id: 'saved', label: 'Saved Reports' },
  ]
  return (
    <div className="anl-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`anl-tab ${active === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
