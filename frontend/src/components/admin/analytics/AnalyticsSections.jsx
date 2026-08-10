import { formatCurrency } from '../../../utils/format'

function ListPanel({ title, items, renderItem, empty = 'No data' }) {
  return (
    <section className="anl-panel">
      <h2>{title}</h2>
      {!items?.length ? <p className="anl-todo-hint">{empty}</p> : (
        <ul className="anl-list">
          {items.map((item, i) => (
            <li key={item.sku || item.name || item.label || i}>{renderItem(item)}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function ProductAnalyticsSection({ data }) {
  return (
    <div className="anl-sections-grid">
      <ListPanel
        title="Top Selling Products"
        items={data.topSelling}
        renderItem={(i) => (<><span>{i.name}</span><strong>{i.qty} sold</strong></>)}
      />
      <ListPanel
        title="Highest Revenue Products"
        items={data.highestRevenue}
        renderItem={(i) => (<><span>{i.name}</span><strong>{formatCurrency(i.revenue)}</strong></>)}
      />
      <ListPanel
        title="Low Stock Products"
        items={data.lowStock}
        renderItem={(i) => (<><span>{i.name} ({i.sku})</span><strong>{i.stock} left</strong></>)}
      />
      <ListPanel
        title="Out Of Stock"
        items={data.outOfStock}
        renderItem={(i) => (<><span>{i.name}</span><strong>0</strong></>)}
      />
      <section className="anl-panel">
        <h2>Most Viewed Products</h2>
        <p className="anl-todo-hint">TODO: Product views tracking API not available</p>
      </section>
      <ListPanel
        title="Category Performance (stock units)"
        items={data.categoryPerformance}
        renderItem={(i) => (<><span>{i.label}</span><strong>{i.value}</strong></>)}
      />
    </div>
  )
}

export function CustomerAnalyticsSection({ data }) {
  return (
    <div className="anl-sections-grid">
      <section className="anl-panel">
        <h2>Customer Overview</h2>
        <ul className="anl-list">
          <li><span>Total Customers</span><strong>{data.total}</strong></li>
          <li><span>New Customers (month)</span><strong>{data.newCustomers}</strong></li>
          <li><span>Returning Customers</span><strong>{data.returningCustomers}</strong></li>
          <li><span>Active / Inactive</span><strong>{data.activeCustomers} / {data.inactiveCustomers}</strong></li>
          <li><span>Repeat Purchase Rate</span><strong>{data.repeatPurchaseRate.toFixed(1)}%</strong></li>
          <li><span>Avg Lifetime Value</span><strong>{formatCurrency(data.averageLtv)}</strong></li>
        </ul>
      </section>
      <ListPanel
        title="Top Buyers"
        items={data.topBuyers}
        renderItem={(i) => (<><span>{i.name}</span><strong>{formatCurrency(i.revenue)} · {i.orders} orders</strong></>)}
      />
    </div>
  )
}

export function OrderAnalyticsSection({ kpis, ordersTrend }) {
  return (
    <div className="anl-sections-grid">
      <section className="anl-panel">
        <h2>Order Analytics</h2>
        <ul className="anl-list">
          <li><span>Total Orders</span><strong>{kpis.totalOrders}</strong></li>
          <li><span>Completed</span><strong>{kpis.completedOrders}</strong></li>
          <li><span>Pending</span><strong>{kpis.pendingOrders}</strong></li>
          <li><span>Cancelled</span><strong>{kpis.cancelledOrders}</strong></li>
          <li><span>Refunded</span><strong>{kpis.refundedOrders}</strong></li>
        </ul>
        <p className="anl-todo-hint" style={{ marginTop: 12 }}>Avg processing/delivery time: TODO — requires fulfillment timestamps API</p>
      </section>
      <ListPanel
        title="Orders Per Period"
        items={ordersTrend}
        renderItem={(i) => (<><span>{i.label}</span><strong>{i.value}</strong></>)}
      />
    </div>
  )
}

export function PaymentAnalyticsSection({ data }) {
  return (
    <div className="anl-sections-grid">
      <section className="anl-panel">
        <h2>Payment Analytics</h2>
        <ul className="anl-list">
          <li><span>Successful</span><strong>{data.successful}</strong></li>
          <li><span>Failed</span><strong>{data.failed}</strong></li>
          <li><span>Refunded</span><strong>{data.refunded}</strong></li>
          <li><span>COD Orders</span><strong>{data.codOrders}</strong></li>
          <li><span>Online Orders</span><strong>{data.onlineOrders}</strong></li>
        </ul>
      </section>
      <ListPanel
        title="Revenue by Gateway"
        items={data.byGateway}
        renderItem={(i) => (<><span>{i.label}</span><strong>{formatCurrency(i.revenue)}</strong></>)}
      />
    </div>
  )
}

export function ShippingAnalyticsSection({ data }) {
  return (
    <div className="anl-sections-grid">
      <section className="anl-panel">
        <h2>Shipping Analytics</h2>
        <ul className="anl-list">
          <li><span>Total Shipped</span><strong>{data.totalShipped}</strong></li>
          <li><span>Delivered</span><strong>{data.delivered}</strong></li>
          <li><span>Success Rate</span><strong>{data.deliverySuccessRate.toFixed(1)}%</strong></li>
          <li><span>Shipping Cost</span><strong>{formatCurrency(data.shippingCost)}</strong></li>
          <li><span>Avg Delivery Days</span><strong>{data.averageDeliveryDays != null ? data.averageDeliveryDays.toFixed(1) : '—'}</strong></li>
          <li><span>Returned Shipments</span><strong>{data.returnedShipments}</strong></li>
        </ul>
        <p className="anl-todo-hint" style={{ marginTop: 12 }}>Late deliveries: TODO — SLA tracking API</p>
      </section>
      <ListPanel
        title="Orders by Courier"
        items={data.byCourier}
        renderItem={(i) => (<><span>{i.label}</span><strong>{i.value}</strong></>)}
      />
    </div>
  )
}

export function InventoryAnalyticsSection({ data }) {
  return (
    <div className="anl-sections-grid">
      <section className="anl-panel">
        <h2>Inventory Analytics</h2>
        <ul className="anl-list">
          <li><span>Inventory Value</span><strong>{formatCurrency(data.inventoryValue)}</strong></li>
          <li><span>Stock Turnover</span><strong>{data.stockTurnover ?? 'TODO'}</strong></li>
        </ul>
        <p className="anl-todo-hint" style={{ marginTop: 12 }}>Warehouse performance: TODO — multi-warehouse API</p>
      </section>
      <ListPanel title="Fast Moving" items={data.fastMoving} renderItem={(i) => (<><span>{i.name}</span><strong>{i.sold} sold</strong></>)} />
      <ListPanel title="Slow Moving" items={data.slowMoving} renderItem={(i) => (<><span>{i.name}</span><strong>{i.sold} sold · {i.stock} stock</strong></>)} />
      <ListPanel title="Dead Stock" items={data.deadStock} renderItem={(i) => (<><span>{i.name}</span><strong>{i.stock} units</strong></>)} />
    </div>
  )
}

export function MarketingAnalyticsSection({ data }) {
  return (
    <div className="anl-sections-grid">
      <section className="anl-panel">
        <h2>Marketing Analytics</h2>
        <ul className="anl-list">
          <li><span>Coupon Usage</span><strong>{data.couponUsage}</strong></li>
          <li><span>Campaign Revenue</span><strong>{formatCurrency(data.campaignRevenue)}</strong></li>
          <li><span>Discount Impact</span><strong>{formatCurrency(data.discountImpact)}</strong></li>
          <li><span>Organic Orders</span><strong>{data.organicOrders}</strong></li>
          <li><span>Paid Orders</span><strong>{data.paidOrders}</strong></li>
        </ul>
        <p className="anl-todo-hint" style={{ marginTop: 12 }}>Referral / paid acquisition: TODO — UTM tracking API</p>
      </section>
      <ListPanel
        title="Coupon Breakdown"
        items={data.couponBreakdown}
        renderItem={(i) => (<><span>{i.label}</span><strong>{i.value} uses</strong></>)}
      />
    </div>
  )
}
