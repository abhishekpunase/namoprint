import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCouponList } from '../../hooks/useCouponList'
import { CouponDashboard } from '../../components/admin/coupons/CouponDashboard'
import {
  CouponFilters,
  CouponSearchBar,
  CouponToolbar,
  CouponPagination,
} from '../../components/admin/coupons/CouponFilters'
import { CouponTable, CouponTableSkeleton } from '../../components/admin/coupons/CouponTable'
import { CouponImportExportModal } from '../../components/admin/coupons/CouponWizard'
import { saveLocalDraft, normalizeCode } from '../../utils/couponAdminUtils'

export function AdminCouponsPage() {
  const list = useCouponList()
  const [importOpen, setImportOpen] = useState(false)
  const [toast, setToast] = useState('')

  const handleSort = (key) => {
    if (list.sortKey === key) list.setSortDir(list.sortDir === 'asc' ? 'desc' : 'asc')
    else {
      list.setSortKey(key)
      list.setSortDir('asc')
    }
  }

  const toggleColumn = (col) => {
    list.setVisibleColumns((c) => (c.includes(col) ? c.filter((x) => x !== col) : [...c, col]))
  }

  const clearFilters = () => {
    list.setSearch('')
    list.setFilters({ status: '', type: '', automatic: '', source: '' })
  }

  const allSelected = list.paginated.length > 0 && list.selected.length === list.paginated.length

  const handleDuplicate = (row) => {
    const code = list.duplicateCoupon(row)
    setToast(`Duplicated as ${code}`)
  }

  const handleBulkEnable = () => {
    list.bulkEnable(list.selected)
    list.setSelected([])
    setToast('Selected coupons enabled (metadata)')
  }

  const handleBulkDisable = () => {
    list.bulkDisable(list.selected)
    list.setSelected([])
    setToast('Selected coupons disabled (metadata)')
  }

  const handleImport = (text) => {
    const lines = text.trim().split('\n').slice(1)
    let count = 0
    lines.forEach((line) => {
      const [code, name, type, value, status] = line.split(',').map((s) => s.trim())
      if (!code) return
      saveLocalDraft({
        code: normalizeCode(code),
        name: name || code,
        type: type || 'percent',
        value: Number(value) || 10,
        status: status || 'draft',
        label: name || code,
      })
      count += 1
    })
    list.load()
    setToast(`Imported ${count} coupon draft(s). TODO: POST /admin/coupons to activate.`)
  }

  return (
    <div className="cpn-page">
      <header className="cpn-page-header">
        <div>
          <nav className="cpn-breadcrumb"><Link to="/admin">Admin</Link> / <span>Coupons</span></nav>
          <h1>Coupons & Discount Management</h1>
          <p>Manage promotional codes. Live coupons from <code>GET /api/coupons</code>; new coupons saved locally until admin API exists.</p>
        </div>
        <CouponSearchBar value={list.search} onChange={list.setSearch} onSubmit={list.refresh} />
      </header>

      {list.error ? (
        <div className="cpn-message cpn-message--err">
          {list.error}
          <button type="button" className="cpn-btn cpn-btn--ghost" style={{ marginLeft: 8 }} onClick={list.refresh}>Retry</button>
        </div>
      ) : null}
      {toast ? <p className="cpn-message">{toast}</p> : null}

      <CouponDashboard stats={list.dashboard} loading={list.loading} />

      <div className="cpn-quick-actions">
        <Link to="/admin/coupons/new" className="cpn-btn cpn-btn--primary">Create Coupon</Link>
        <button type="button" className="cpn-btn cpn-btn--ghost" onClick={() => setImportOpen(true)}>Import Coupons</button>
        <button type="button" className="cpn-btn cpn-btn--ghost" onClick={list.exportCsv}>Export Coupons</button>
        <button type="button" className="cpn-btn cpn-btn--ghost" onClick={list.refresh}>Refresh</button>
      </div>

      <CouponFilters filters={list.filters} onChange={list.setFilters} onClear={clearFilters} />

      <section className="cpn-panel">
        <CouponToolbar
          total={list.total}
          selectedCount={list.selected.length}
          onRefresh={list.refresh}
          refreshing={list.refreshing}
          onExportCsv={list.exportCsv}
          onExportExcel={list.exportExcel}
          onPrint={list.printList}
          onImport={() => setImportOpen(true)}
          visibleColumns={list.visibleColumns}
          onToggleColumn={toggleColumn}
          onBulkEnable={handleBulkEnable}
          onBulkDisable={handleBulkDisable}
          onBulkExport={list.exportCsv}
        />

        {list.loading ? (
          <CouponTableSkeleton />
        ) : (
          <>
            <CouponTable
              rows={list.paginated}
              selected={list.selected}
              onToggleSelect={list.toggleSelect}
              onToggleSelectAll={list.toggleSelectAll}
              allSelected={allSelected}
              visibleColumns={list.visibleColumns}
              sortKey={list.sortKey}
              sortDir={list.sortDir}
              onSort={handleSort}
              onDisable={list.disableCoupon}
              onEnable={list.enableCoupon}
              onDuplicate={handleDuplicate}
              onArchive={list.archiveCoupon}
            />
            <CouponPagination
              page={list.page}
              pageSize={list.pageSize}
              total={list.total}
              onPageChange={list.setPage}
              onPageSizeChange={(size) => {
                list.setPageSize(size)
                list.setPage(1)
              }}
            />
          </>
        )}
      </section>

      <CouponImportExportModal open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
    </div>
  )
}
