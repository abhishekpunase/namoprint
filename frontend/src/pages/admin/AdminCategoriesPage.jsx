import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useCategoryList } from '../../hooks/useCategoryList'
import { api } from '../../services/api'
import { buildCategoryPayload, categoryToForm } from '../../utils/categoryFormUtils'
import { CategoryBulkActionsBar, CategoryListToolbar, DeleteCategoryDialog } from '../../components/admin/categories/CategoryToolbar'
import { CategoryFilters, CategorySearchBar } from '../../components/admin/categories/CategoryFilters'
import { CategoryTable, CategoryPagination } from '../../components/admin/categories/CategoryTable'
import { CategoryTree } from '../../components/admin/categories/CategoryTree'
import { CategorySidebar, CategoryQuickActions } from '../../components/admin/categories/CategorySidebar'
import { CategoryImportExport } from '../../components/admin/categories/CategoryImportExport'

export function AdminCategoriesPage() {
  const navigate = useNavigate()
  const list = useCategoryList()
  const [deleteTarget, setDeleteTarget] = useState(null)

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

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await api.adminDeleteCategory(deleteTarget._id)
    setDeleteTarget(null)
    list.load()
  }

  const duplicateCategory = async (category) => {
    try {
      const form = categoryToForm(category)
      form.name = `${form.name} (Copy)`
      await api.adminCreateCategory(buildCategoryPayload(form))
      list.load()
    } catch (err) {
      alert(err.message)
    }
  }

  const downloadTemplate = () => {
    const csv = 'Name,ProductType,Parent,Description,SortOrder,Active\nSample Category,acrylic-wall-photo,,Description,0,true'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'category-import-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const hasFilters = Boolean(list.search || Object.values(list.filters).some(Boolean) || list.sidebarFilter !== 'all')

  const clearFilters = () => {
    list.setSearch('')
    list.setSidebarFilter('all')
    list.setFilters({
      status: '',
      parent: '',
      productCount: '',
      dateFrom: '',
      dateTo: '',
      featured: '',
    })
  }

  return (
    <div className="cat-page">
      <header className="cat-page-header">
        <div>
          <nav className="cat-breadcrumb">
            <Link to="/admin">Admin</Link> / <span>Categories</span>
          </nav>
          <h1>Category Management</h1>
          <p>Organize products with hierarchical categories, tree view, and storefront display order.</p>
        </div>
        <Link to="/admin/categories/new" className="cat-btn cat-btn--primary">
          <Plus size={16} /> Add Category
        </Link>
      </header>

      <CategoryQuickActions
        onAdd={() => navigate('/admin/categories/new')}
        onExport={() => list.exportCsv()}
        onImport={() => {}}
        onManageOrder={() => list.setViewMode('tree')}
      />

      {list.error ? (
        <div className="cat-alert cat-alert--error">
          {list.error}
          <button type="button" className="cat-btn cat-btn--ghost" onClick={list.load}>Retry</button>
        </div>
      ) : null}

      <div className="cat-layout">
        <CategorySidebar
          activeFilter={list.sidebarFilter}
          onFilterChange={(filter) => { list.setSidebarFilter(filter); list.setPage(1) }}
          totalCount={list.categories.length}
        />

        <div className="cat-layout__main">
          <CategorySearchBar value={list.search} onChange={list.setSearch} />
          <CategoryFilters filters={list.filters} onChange={list.setFilters} parentCategories={list.parentCategories} />

          <CategoryBulkActionsBar
            selectedCount={list.selected.length}
            onPublish={list.bulkActivate}
            onHide={list.bulkHide}
            onArchive={list.bulkArchive}
            onExport={() => list.exportCsv(list.categories.filter((c) => list.selected.includes(c._id)))}
            onRefresh={list.load}
            refreshing={list.loading}
          />

          <section className="cat-panel">
            <CategoryListToolbar
              total={list.filtered.length}
              viewMode={list.viewMode}
              onViewModeChange={list.setViewMode}
              onRefresh={list.load}
              onExportCsv={() => list.exportCsv()}
              onExportExcel={() => list.exportExcel()}
              onPrint={list.printTable}
              refreshing={list.loading}
              visibleColumns={list.visibleColumns}
              onToggleColumn={toggleColumn}
            />

            {list.viewMode === 'tree' ? (
              <CategoryTree
                tree={hasFilters ? list.filteredTree : list.tree}
                loading={list.loading}
                expandedIds={list.expandedIds}
                onToggleExpanded={list.toggleExpanded}
                countProducts={list.countProducts}
                onReorder={list.reorderCategory}
                hasFilters={hasFilters}
                onClearFilters={clearFilters}
                onCreate={() => navigate('/admin/categories/new')}
              />
            ) : (
              <>
                <CategoryTable
                  categories={list.paginated}
                  allCategories={list.categories}
                  loading={list.loading}
                  selected={list.selected}
                  onToggleSelect={list.toggleSelect}
                  onToggleSelectAll={list.toggleSelectAll}
                  visibleColumns={list.visibleColumns}
                  sortKey={list.sortKey}
                  sortDir={list.sortDir}
                  onSort={handleSort}
                  onDelete={setDeleteTarget}
                  onDuplicate={duplicateCategory}
                  countProducts={list.countProducts}
                  hasFilters={hasFilters}
                  onClearFilters={clearFilters}
                  onCreate={() => navigate('/admin/categories/new')}
                />
                <CategoryPagination
                  page={list.page}
                  totalPages={list.totalPages}
                  pageSize={list.pageSize}
                  onPageChange={list.setPage}
                  onPageSizeChange={(size) => { list.setPageSize(size); list.setPage(1) }}
                />
              </>
            )}
          </section>

          <CategoryImportExport onExport={() => list.exportCsv()} onDownloadTemplate={downloadTemplate} />
        </div>
      </div>

      <DeleteCategoryDialog
        open={Boolean(deleteTarget)}
        categoryName={deleteTarget?.name}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
