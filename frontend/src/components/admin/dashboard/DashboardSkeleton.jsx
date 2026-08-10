import { Skeleton } from '../ui/Loader'
import { DashboardHeader } from './DashboardHeader'

export function DashboardSkeleton() {
  return (
    <div className="dash-page">
      <DashboardHeader onRefresh={() => {}} onExport={() => {}} refreshing />
      <div className="dash-stat-grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="dash-stat-card__skeleton-block" />
        ))}
      </div>
      <div className="dash-grid dash-grid--2">
        <Skeleton className="dash-chart-skeleton" />
        <Skeleton className="dash-chart-skeleton dash-chart-skeleton--round" />
      </div>
      <Skeleton className="dash-table-skeleton" />
    </div>
  )
}

export function DashboardError({ message, onRetry }) {
  return (
    <div className="dash-page">
      <section className="dash-panel dash-panel--error">
        <h2>Unable to load dashboard</h2>
        <p>{message || 'Network error. Please try again.'}</p>
        <button type="button" className="dash-btn dash-btn--primary" onClick={onRetry}>
          Retry
        </button>
      </section>
    </div>
  )
}
