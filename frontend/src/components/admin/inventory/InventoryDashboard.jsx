import { formatCurrency } from '../../../utils/format'

export function InventoryDashboard({ stats, loading }) {
  if (loading) {
    return (
      <div className="inv-dashboard inv-dashboard--skeleton">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="inv-stat-card inv-skeleton" />
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Total Inventory Units', value: stats.totalInventory?.toLocaleString('en-IN') },
    { label: 'Low Stock Items', value: stats.lowStock, tone: 'warning' },
    { label: 'Out of Stock', value: stats.outOfStock, tone: 'danger' },
    { label: 'Reserved Stock', value: stats.reserved, tone: 'info' },
    { label: 'Incoming Stock', value: stats.incoming, todo: true },
    { label: 'Warehouses', value: stats.warehouseCount, todo: true },
    { label: 'Inventory Value', value: formatCurrency(stats.inventoryValue || 0) },
    { label: "Today's Movements", value: stats.todayMovement },
    { label: 'SKU / Variants', value: stats.variantCount },
  ]

  return (
    <div className="inv-dashboard">
      {cards.map((card) => (
        <article key={card.label} className={`inv-stat-card ${card.tone ? `inv-stat-card--${card.tone}` : ''}`}>
          <span>{card.label}{card.todo ? ' *' : ''}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </div>
  )
}
