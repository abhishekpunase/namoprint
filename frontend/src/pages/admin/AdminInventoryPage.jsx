import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInventoryList } from '../../hooks/useInventoryList'
import { InventoryDashboard } from '../../components/admin/inventory/InventoryDashboard'
import {
  InventoryFilters,
  InventorySearchBar,
  InventoryToolbar,
  InventoryPagination,
} from '../../components/admin/inventory/InventoryFilters'
import { InventoryTable, InventoryTableSkeleton } from '../../components/admin/inventory/InventoryTable'
import { AdjustmentModal, TransferModal } from '../../components/admin/inventory/AdjustmentModal'
import {
  LowStockPanel,
  OutOfStockPanel,
  WarehousePanel,
  SupplierPanel,
  InventoryAnalyticsPanel,
} from '../../components/admin/inventory/InventoryPanels'
import { InventoryReportsModal, InventoryImportModal } from '../../components/admin/inventory/InventoryReports'

export function AdminInventoryPage() {
  const list = useInventoryList()
  const [adjustRow, setAdjustRow] = useState(null)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [saving, setSaving] = useState(false)
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

  const openAdjust = (row) => {
    setAdjustRow(row)
    setAdjustOpen(true)
  }

  const handleAdjustSave = async (payload) => {
    if (!adjustRow) return
    setSaving(true)
    try {
      if (payload.mode === 'set') {
        await list.adjustRowStock({
          row: adjustRow,
          newStock: payload.newStock,
          reason: payload.reason,
          notes: payload.notes,
        })
      } else {
        await list.adjustRowStock({
          row: adjustRow,
          delta: payload.delta,
          reason: payload.reason,
          notes: payload.notes,
        })
      }
      setToast('Stock updated successfully')
      setAdjustOpen(false)
      setAdjustRow(null)
    } catch (err) {
      setToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  const clearFilters = () => {
    list.setSearch('')
    list.setFilters({ stockStatus: '', warehouse: '', category: '', brand: '', reserved: '' })
  }

  const allSelected = list.paginated.length > 0 && list.selected.length === list.paginated.length

  return (
    <div className="inv-page">
      <header className="inv-page-header">
        <div>
          <nav className="inv-breadcrumb"><Link to="/admin">Admin</Link> / <span>Inventory</span></nav>
          <h1>Inventory & Stock Management</h1>
          <p>Track variant stock from existing products. Updates use <code>PATCH /admin/products/:id</code>.</p>
        </div>
        <InventorySearchBar value={list.search} onChange={list.setSearch} onSubmit={list.refresh} />
      </header>

      {list.error ? <p className="inv-message inv-message--err">{list.error}</p> : null}
      {toast ? <p className="inv-message">{toast}</p> : null}

      <InventoryDashboard stats={list.dashboard} loading={list.loading} />

      <div className="inv-quick-actions">
        <button type="button" className="inv-btn inv-btn--primary" onClick={() => list.paginated[0] ? openAdjust(list.paginated[0]) : setToast('Select a product row to adjust stock')}>Stock Adjustment</button>
        <button type="button" className="inv-btn inv-btn--ghost" onClick={() => setTransferOpen(true)}>Transfer Stock</button>
        <button type="button" className="inv-btn inv-btn--ghost" onClick={() => setImportOpen(true)}>Import</button>
        <button type="button" className="inv-btn inv-btn--ghost" onClick={list.exportCsv}>Export</button>
        <button type="button" className="inv-btn inv-btn--ghost" onClick={() => setReportsOpen(true)}>Reports</button>
      </div>

      <InventoryFilters filters={list.filters} onChange={list.setFilters} options={list.filterOptions} onClear={clearFilters} />

      <section className="inv-panel">
        <InventoryToolbar
          total={list.total}
          selectedCount={list.selected.length}
          density={list.density}
          onDensityChange={list.setDensity}
          onRefresh={list.refresh}
          refreshing={list.refreshing}
          onExportCsv={list.exportCsv}
          onExportExcel={list.exportExcel}
          onPrint={list.printList}
          onImport={() => setImportOpen(true)}
          onReports={() => setReportsOpen(true)}
          onAdjust={() => (list.paginated[0] ? openAdjust(list.paginated[0]) : setToast('Select a row to adjust'))}
          visibleColumns={list.visibleColumns}
          onToggleColumn={toggleColumn}
          onBulkUpdate={() => {}}
        />

        {list.loading ? (
          <InventoryTableSkeleton />
        ) : (
          <>
            <InventoryTable
              rows={list.paginated}
              selected={list.selected}
              onToggleSelect={list.toggleSelect}
              onToggleSelectAll={list.toggleSelectAll}
              allSelected={allSelected}
              visibleColumns={list.visibleColumns}
              sortKey={list.sortKey}
              sortDir={list.sortDir}
              onSort={handleSort}
              onAdjust={openAdjust}
              density={list.density}
            />
            <InventoryPagination
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

      <div className="inv-panels-grid">
        <LowStockPanel rows={list.lowStockRows} onAdjust={openAdjust} />
        <OutOfStockPanel rows={list.outOfStockRows} onAdjust={openAdjust} />
      </div>

      <InventoryAnalyticsPanel analytics={list.analytics} />

      <div className="inv-panels-grid">
        <WarehousePanel />
        <SupplierPanel />
      </div>

      <AdjustmentModal
        open={adjustOpen}
        row={adjustRow}
        onClose={() => { setAdjustOpen(false); setAdjustRow(null) }}
        onSave={handleAdjustSave}
        saving={saving}
      />
      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />
      <InventoryReportsModal
        open={reportsOpen}
        onClose={() => setReportsOpen(false)}
        rows={list.filtered}
        lowStock={list.lowStockRows}
        outOfStock={list.outOfStockRows}
      />
      <InventoryImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
