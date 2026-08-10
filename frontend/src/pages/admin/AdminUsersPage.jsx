import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserList } from '../../hooks/useUserList'
import { UsersTable } from '../../components/admin/users/UsersTable'
import { UserListToolbar, UserSearchBar, UserFilters, UserPagination } from '../../components/admin/users/UserToolbar'
import { AddUserModal } from '../../components/admin/users/UserProfile'
import { Skeleton } from '../../components/admin/ui/Loader'

export function AdminUsersPage() {
  const list = useUserList({ defaultRole: 'admin' })
  const [addOpen, setAddOpen] = useState(false)

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

  return (
    <div className="usr-page">
      <header className="usr-page-header">
        <div>
          <nav className="usr-breadcrumb"><Link to="/admin">Admin</Link> / <span>Users</span></nav>
          <h1>Staff & Admin Users</h1>
          <p>Manage administrator accounts. Storefront customers are in <Link to="/admin/customers">Customer Management</Link>.</p>
        </div>
        <UserSearchBar value={list.search} onChange={list.setSearch} onSubmit={list.refresh} />
      </header>

      {list.error ? <p className="usr-message usr-message--err">{list.error}</p> : null}

      <UserFilters
        filters={list.filters}
        onChange={list.setFilters}
        departments={list.departments}
        onClear={() => list.setFilters({ role: '', status: '', department: '' })}
      />

      <section className="usr-panel">
        <UserListToolbar
          total={list.total}
          onRefresh={list.refresh}
          refreshing={list.refreshing}
          onExportCsv={list.exportCsv}
          onExportExcel={list.exportExcel}
          onPrint={list.printList}
          visibleColumns={list.visibleColumns}
          onToggleColumn={toggleColumn}
          onAddUser={() => setAddOpen(true)}
        />

        {list.loading ? (
          <Skeleton className="usr-skeleton" />
        ) : (
          <>
            <UsersTable
              users={list.paginated}
              selected={list.selected}
              onToggleSelect={list.toggleSelect}
              onToggleSelectAll={list.toggleSelectAll}
              allSelected={allSelected}
              visibleColumns={list.visibleColumns}
              sortKey={list.sortKey}
              sortDir={list.sortDir}
              onSort={handleSort}
              onToggleStatus={list.toggleStatus}
            />
            <UserPagination
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

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
