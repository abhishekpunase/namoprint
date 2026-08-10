import { formatBytes } from '../../../utils/mediaAdminUtils'

export function MediaDashboard({ stats, loading }) {
  if (loading) {
    return (
      <div className="med-dashboard">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="med-stat-card med-skeleton" />
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Total Files', value: stats.total },
    { label: 'Images', value: stats.images },
    { label: 'Videos', value: stats.videos },
    { label: 'Documents', value: stats.documents },
    { label: 'Audio Files', value: stats.audio },
    { label: 'Storage Used', value: formatBytes(stats.storageUsed) },
    { label: 'Storage Available', value: formatBytes(stats.storageAvailable) },
    { label: "Today's Uploads", value: stats.uploadsToday },
    { label: 'Recent Downloads', value: stats.recentDownloads },
  ]

  return (
    <div className="med-dashboard">
      {cards.map((card) => (
        <article key={card.label} className="med-stat-card">
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </div>
  )
}
