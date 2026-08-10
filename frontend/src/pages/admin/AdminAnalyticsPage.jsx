import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { KpiGrid, GoalsPanel, RealTimePanel } from '../../components/admin/analytics/KpiGrid'
import { AnalyticsFilters, AnalyticsSearchBar, AnalyticsTabs } from '../../components/admin/analytics/AnalyticsFilters'
import {
  ProductAnalyticsSection,
  CustomerAnalyticsSection,
  OrderAnalyticsSection,
  PaymentAnalyticsSection,
  ShippingAnalyticsSection,
  InventoryAnalyticsSection,
  MarketingAnalyticsSection,
} from '../../components/admin/analytics/AnalyticsSections'
import { ReportCenter, ReportBuilder, SavedReportsPanel } from '../../components/admin/analytics/ReportCenter'
import { RevenueChart, PieChartCard, BarChartCard } from '../../components/admin/dashboard/Charts'

export function AdminAnalyticsPage() {
  const anl = useAnalytics()
  const [toast, setToast] = useState('')

  const handleExport = (reportType, label) => {
    anl.exportReport(reportType, `${reportType}-report`)
    setToast(`${label || reportType} exported as CSV`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSaveReport = (report) => {
    anl.persistReport(report)
    setToast(`Report "${report.name}" saved locally`)
  }

  return (
    <div className="anl-page">
      <header className="anl-page-header">
        <div>
          <nav className="anl-breadcrumb"><Link to="/admin">Admin</Link> / <span>Analytics &amp; Reports</span></nav>
          <h1>Analytics, Reports &amp; Business Intelligence</h1>
          <p>Derived from <code>GET /admin/dashboard</code>, orders, products, customers, coupons — no backend changes.</p>
        </div>
        <AnalyticsSearchBar value={anl.search} onChange={anl.setSearch} />
      </header>

      {anl.error ? (
        <div className="anl-message anl-message--err">
          {anl.error}
          <button type="button" className="anl-btn anl-btn--ghost" style={{ marginLeft: 8 }} onClick={anl.refresh}>Retry</button>
        </div>
      ) : null}
      {toast ? <p className="anl-message">{toast}</p> : null}

      <AnalyticsTabs active={anl.activeTab} onChange={anl.setActiveTab} />

      <AnalyticsFilters
        range={anl.range}
        onRangeChange={anl.setRange}
        customRange={anl.customRange}
        onCustomRangeChange={anl.setCustomRange}
        compareMode={anl.compareMode}
        onCompareChange={anl.setCompareMode}
        onRefresh={anl.refresh}
        refreshing={anl.refreshing}
      />

      {anl.activeTab === 'overview' ? (
        <>
          <KpiGrid kpis={anl.kpis} growth={anl.growth} loading={anl.loading} />

          <div className="anl-charts-grid">
            <div className="anl-chart-wrap">
              <RevenueChart
                data={anl.revenueSeries}
                period={anl.revenuePeriod}
                onPeriodChange={anl.setRevenuePeriod}
                loading={anl.loading}
              />
            </div>
            <div className="anl-chart-wrap">
              <BarChartCard
                title="Orders Trend"
                subtitle="Order volume over time"
                data={anl.ordersTrend}
                loading={anl.loading}
              />
            </div>
            <div className="anl-chart-wrap">
              <PieChartCard
                data={anl.pieData}
                mode={anl.chartMode}
                onModeChange={anl.setChartMode}
                loading={anl.loading}
                title="Distribution"
              />
            </div>
            <div className="anl-chart-wrap">
              <BarChartCard
                title="Category Performance"
                subtitle="Orders by category (estimated)"
                data={anl.categoryBar}
                loading={anl.loading}
              />
            </div>
          </div>

          <div className="anl-sections-grid">
            <GoalsPanel kpis={anl.kpis} goals={anl.goals} onUpdate={anl.updateGoals} />
            <RealTimePanel realtime={anl.realtime} />
          </div>

          <ProductAnalyticsSection data={anl.productAnalytics} />
          <CustomerAnalyticsSection data={anl.customerAnalytics} />
          <OrderAnalyticsSection kpis={anl.kpis} ordersTrend={anl.ordersTrend} />
          <PaymentAnalyticsSection data={anl.paymentAnalytics} />
          <ShippingAnalyticsSection data={anl.shippingAnalytics} />
          <InventoryAnalyticsSection data={anl.inventoryAnalytics} />
          <MarketingAnalyticsSection data={anl.marketingAnalytics} />
        </>
      ) : null}

      {anl.activeTab === 'reports' ? (
        <ReportCenter onExport={handleExport} onPrint={handlePrint} />
      ) : null}

      {anl.activeTab === 'builder' ? (
        <ReportBuilder onGenerate={handleExport} onSave={handleSaveReport} />
      ) : null}

      {anl.activeTab === 'saved' ? (
        <SavedReportsPanel
          reports={anl.savedReports}
          onRun={handleExport}
          onDelete={(id) => { anl.removeReport(id); setToast('Report deleted') }}
        />
      ) : null}
    </div>
  )
}
