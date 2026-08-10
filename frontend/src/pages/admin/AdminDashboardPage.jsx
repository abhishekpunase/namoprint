import {
  Ban,
  CheckCircle2,
  Clock3,
  FolderTree,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Warehouse,
} from 'lucide-react'
import {
  ActivityTimeline,
  BarChartCard,
  CustomerList,
  DashboardError,
  DashboardFilters,
  DashboardHeader,
  DashboardSearch,
  DashboardSkeleton,
  LowStockPanel,
  NotificationPanel,
  PieChartCard,
  QuickActions,
  RecentOrdersTable,
  RevenueChart,
  ShortcutSection,
  StatCard,
  StatCardGrid,
  SystemStatus,
  TopProductsPanel,
} from '../../components/admin/dashboard'
import { TODO_MOCK_SHORTCUTS } from '../../data/dashboardPlaceholders'
import { useAdminDashboard } from '../../hooks/useAdminDashboard'
import { formatCurrency } from '../../utils/format'

const spark = (series) => series.slice(-6).map((point) => ({ label: point.label, value: point.value || 0 }))

export function AdminDashboardPage() {
  const {
    loading,
    error,
    reload,
    range,
    setRange,
    customRange,
    setCustomRange,
    revenuePeriod,
    setRevenuePeriod,
    pieMode,
    setPieMode,
    search,
    setSearch,
    derived,
    revenueSeries,
    pieData,
    barData,
    monthlyOrdersBar,
    inventoryBar,
    topProducts,
    lowStock,
    recentOrders,
    latestCustomers,
    activity,
    exportSummary,
  } = useAdminDashboard()

  if (loading && !derived.totalOrders && !error) {
    return <DashboardSkeleton />
  }

  if (error && !derived.totalOrders) {
    return <DashboardError message={error} onRetry={reload} />
  }

  const trend = spark(revenueSeries)

  const statCards = [
    {
      title: 'Total Revenue',
      numericValue: derived.totalRevenue,
      formatValue: (v) => formatCurrency(v),
      icon: IndianRupee,
      tone: 'indigo',
      growth: 8.4,
      comparison: 'All paid orders',
      trend,
    },
    {
      title: 'Total Orders',
      numericValue: derived.totalOrders,
      icon: ShoppingBag,
      tone: 'violet',
      growth: 5.2,
      comparison: 'Lifetime orders',
      trend,
    },
    {
      title: 'Total Products',
      numericValue: derived.totalProducts,
      icon: Package,
      tone: 'cyan',
      growth: 2.1,
      comparison: 'Catalog size',
      trend,
    },
    {
      title: 'Total Customers',
      numericValue: derived.totalCustomers,
      icon: Users,
      tone: 'green',
      growth: 4.6,
      comparison: 'Registered customers',
      trend,
    },
    {
      title: 'Pending Orders',
      numericValue: derived.pendingOrders,
      icon: Clock3,
      tone: 'amber',
      growth: -1.2,
      comparison: 'Awaiting fulfillment',
      trend,
    },
    {
      title: 'Completed Orders',
      numericValue: derived.completedOrders,
      icon: CheckCircle2,
      tone: 'green',
      growth: 6.8,
      comparison: 'Paid / processing pipeline',
      trend,
    },
    {
      title: 'Cancelled Orders',
      numericValue: derived.cancelledOrders,
      icon: Ban,
      tone: 'rose',
      growth: -0.8,
      comparison: 'From admin orders API',
      trend,
    },
    {
      title: 'Total Categories',
      numericValue: derived.totalCategories,
      icon: FolderTree,
      tone: 'sky',
      growth: 1.0,
      comparison: 'Active catalog categories',
      trend,
    },
    {
      title: 'Inventory Value',
      numericValue: derived.inventoryValue,
      formatValue: (v) => formatCurrency(v),
      icon: Warehouse,
      tone: 'slate',
      growth: 3.3,
      comparison: 'Price × stock from products API',
      trend,
    },
    {
      title: "Today's Sales",
      numericValue: derived.todaySales,
      formatValue: (v) => formatCurrency(v),
      icon: TrendingUp,
      tone: 'indigo',
      growth: 12.5,
      comparison: 'Paid orders today',
      trend,
    },
    {
      title: 'Monthly Revenue',
      numericValue: derived.monthlyRevenue,
      formatValue: (v) => formatCurrency(v),
      icon: IndianRupee,
      tone: 'violet',
      growth: 9.1,
      comparison: 'Current month paid revenue',
      trend,
    },
    {
      title: 'New Users',
      numericValue: derived.newUsers,
      icon: Users,
      tone: 'cyan',
      growth: 7.4,
      comparison: 'Customers joined this month',
      trend,
    },
  ]

  return (
    <div className="dash-page">
      <DashboardHeader onRefresh={reload} onExport={exportSummary} refreshing={loading} />

      <DashboardSearch value={search} onChange={setSearch} />
      <DashboardFilters
        range={range}
        onRangeChange={setRange}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
      />

      <StatCardGrid>
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </StatCardGrid>

      <div className="dash-grid dash-grid--2">
        <RevenueChart
          data={revenueSeries}
          period={revenuePeriod}
          onPeriodChange={setRevenuePeriod}
          loading={loading}
        />
        <PieChartCard data={pieData} mode={pieMode} onModeChange={setPieMode} loading={loading} />
      </div>

      <div className="dash-grid dash-grid--3">
        <BarChartCard title="Top Categories" subtitle="Order activity by category" data={barData} loading={loading} />
        <BarChartCard title="Monthly Orders" subtitle="Order volume trend" data={monthlyOrdersBar} loading={loading} />
        <BarChartCard title="Inventory Status" subtitle="Stock units by product" data={inventoryBar} loading={loading} />
      </div>

      <div className="dash-grid dash-grid--2">
        <RecentOrdersTable
          orders={recentOrders}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
        />
        <CustomerList customers={latestCustomers} loading={loading} />
      </div>

      <div className="dash-grid dash-grid--2">
        <LowStockPanel items={lowStock} loading={loading} />
        <TopProductsPanel products={topProducts} loading={loading} />
      </div>

      <div className="dash-grid dash-grid--2">
        <ActivityTimeline events={activity} loading={loading} />
        <QuickActions />
      </div>

      <div className="dash-grid dash-grid--3">
        <ShortcutSection shortcuts={TODO_MOCK_SHORTCUTS} />
        <NotificationPanel />
        <SystemStatus />
      </div>
    </div>
  )
}
