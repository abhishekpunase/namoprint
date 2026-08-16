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
    <div className="max-w-[1440px] mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
        <div className="min-w-0 flex-1">
          <nav className="text-sm text-gray-500 mb-1" aria-label="Breadcrumb">
            <Link to="/admin" className="hover:underline text-blue-600">Admin</Link>
            <span> / </span>
            <span>Analytics &amp; Reports</span>
          </nav>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
            Analytics, Reports &amp; Business Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Derived from <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">GET /admin/dashboard</code>, orders, products, customers, coupons — no backend changes.
          </p>
        </div>
        <div className="w-full md:w-auto md:min-w-[260px] md:max-w-sm">
          <AnalyticsSearchBar value={anl.search} onChange={anl.setSearch} />
        </div>
      </header>

      {/* Messages */}
      {anl.error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-3"
        >
          <span className="flex-1 min-w-0">{anl.error}</span>
          <button
            type="button"
            className="border border-red-300 text-red-700 text-sm px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
            onClick={anl.refresh}
          >
            Retry
          </button>
        </div>
      ) : null}

      {toast ? (
        <p role="status" className="bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg mb-3">
          {toast}
        </p>
      ) : null}

      {/* Tabs */}
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 mb-4">
        <AnalyticsTabs active={anl.activeTab} onChange={anl.setActiveTab} />
      </div>

      {/* Filters */}
      <div className="mb-5">
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
      </div>

      {anl.activeTab === 'overview' ? (
        <>
          <KpiGrid kpis={anl.kpis} growth={anl.growth} loading={anl.loading} />

          {/* Charts grid: 1 col on mobile, 2 on tablet+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            <div className="min-w-0 bg-white rounded-xl p-3 sm:p-4 shadow-sm overflow-x-auto">
              <RevenueChart
                data={anl.revenueSeries}
                period={anl.revenuePeriod}
                onPeriodChange={anl.setRevenuePeriod}
                loading={anl.loading}
              />
            </div>
            <div className="min-w-0 bg-white rounded-xl p-3 sm:p-4 shadow-sm overflow-x-auto">
              <BarChartCard
                title="Orders Trend"
                subtitle="Order volume over time"
                data={anl.ordersTrend}
                loading={anl.loading}
              />
            </div>
            <div className="min-w-0 bg-white rounded-xl p-3 sm:p-4 shadow-sm overflow-x-auto">
              <PieChartCard
                data={anl.pieData}
                mode={anl.chartMode}
                onModeChange={anl.setChartMode}
                loading={anl.loading}
                title="Distribution"
              />
            </div>
            <div className="min-w-0 bg-white rounded-xl p-3 sm:p-4 shadow-sm overflow-x-auto">
              <BarChartCard
                title="Category Performance"
                subtitle="Orders by category (estimated)"
                data={anl.categoryBar}
                loading={anl.loading}
              />
            </div>
          </div>

          {/* Goals + Realtime */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-5">
            <GoalsPanel kpis={anl.kpis} goals={anl.goals} onUpdate={anl.updateGoals} />
            <RealTimePanel realtime={anl.realtime} />
          </div>

          {/* Lower sections stacked */}
          <div className="flex flex-col gap-5 mt-5">
            <ProductAnalyticsSection data={anl.productAnalytics} />
            <CustomerAnalyticsSection data={anl.customerAnalytics} />
            <OrderAnalyticsSection kpis={anl.kpis} ordersTrend={anl.ordersTrend} />
            <PaymentAnalyticsSection data={anl.paymentAnalytics} />
            <ShippingAnalyticsSection data={anl.shippingAnalytics} />
            <InventoryAnalyticsSection data={anl.inventoryAnalytics} />
            <MarketingAnalyticsSection data={anl.marketingAnalytics} />
          </div>
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