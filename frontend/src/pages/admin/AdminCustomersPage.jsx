import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCustomerList } from '../../hooks/useCustomerList'
import {
  CustomerAnalyticsBar,
  CustomerFilters,
  CustomerListToolbar,
  CustomerPagination,
  CustomerSearchBar,
} from '../../components/admin/customers/CustomerFilters'
import { CustomersTable, CustomerTableSkeleton } from '../../components/admin/customers/CustomersTable'
import { CustomerImportExport } from '../../components/admin/customers/CustomerImportExport'

export function AdminCustomersPage() {
  const list = useCustomerList()
  const [importOpen, setImportOpen] = useState(false)

  const handleSort = (key) => {
    if (list.sortKey === key) list.setSortDir(list.sortDir === 'asc' ? 'desc' : 'asc')
    else {
      list.setSortKey(key)
      list.setSortDir('asc')
    }
  }

  const toggleColumn = (col) => {
    list.setVisibleColumns((current) =>
      current.includes(col) ? current.filter((c) => c !== col) : [...current, col],
    )
  }

  const allSelected = list.paginated.length > 0 && list.selected.length === list.paginated.length

  const clearFilters = () => {
    list.setSearch('')
    list.setFilters({
      segment: '',
      status: '',
      country: '',
      state: '',
      city: '',
      dateFrom: '',
      dateTo: '',
      ordersMin: '',
      ordersMax: '',
      ltvMin: '',
      ltvMax: '',
    })
  }

  return (
    <div className="crm-page">
      <header className="crm-page-header">
        <div>
          <nav className="crm-breadcrumb"><Link to="/admin">Admin</Link> / <span>Customers</span></nav>
          <h1>Customer Management</h1>
          <p>Enterprise CRM for storefront buyers — orders, lifetime value, and customer profiles.</p>
        </div>
        <CustomerSearchBar value={list.search} onChange={list.setSearch} onSubmit={list.refresh} />
      </header>

      {list.error ? <p className="crm-message crm-message--err">{list.error}</p> : null}

      <CustomerAnalyticsBar analytics={list.analytics} />

      <CustomerFilters filters={list.filters} onChange={list.setFilters} locations={list.locations} onClear={clearFilters} />

      <section className="crm-panel">
        <CustomerListToolbar
          total={list.total}
          selectedCount={list.selected.length}
          onRefresh={list.refresh}
          refreshing={list.refreshing}
          onExportCsv={list.exportCsv}
          onExportExcel={list.exportExcel}
          onPrint={list.printList}
          onImport={() => setImportOpen(true)}
          onBulkBlock={() => list.bulkBlock(true)}
          onBulkUnblock={() => list.bulkBlock(false)}
          onBulkEmail={() => {}}
          visibleColumns={list.visibleColumns}
          onToggleColumn={toggleColumn}
        />

        {list.loading ? (
          <CustomerTableSkeleton />
        ) : (
          <>
            <CustomersTable
              customers={list.paginated}
              selected={list.selected}
              onToggleSelect={list.toggleSelect}
              onToggleSelectAll={list.toggleSelectAll}
              allSelected={allSelected}
              visibleColumns={list.visibleColumns}
              sortKey={list.sortKey}
              sortDir={list.sortDir}
              onSort={handleSort}
              onToggleBlock={list.toggleBlock}
              onMarkVip={list.markVip}
            />
            <CustomerPagination
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

      <CustomerImportExport open={importOpen} onClose={() => setImportOpen(false)} onExportTemplate={() => {}} />
    </div>
  )
}
