import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useProductList } from '../../hooks/useProductList'
import { api } from '../../services/api'
import { isCatalogDemoProduct, countCatalogSources } from '../../utils/adminProductCatalog'
import { productToForm, buildProductPayload } from '../../utils/productFormUtils'
import {
  BulkActionsBar,
  DeleteProductDialog,
  ProductListToolbar,
} from '../../components/admin/products/ProductToolbar'
import { ProductFilters, ProductSearchBar } from '../../components/admin/products/ProductFilters'
import { ProductTable, ProductPagination } from '../../components/admin/products/ProductTable'
import { ProductImportExport } from '../../components/admin/products/ProductImportExport'

export function AdminProductsPage() {
  const navigate = useNavigate()
  const list = useProductList()
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
    if (isCatalogDemoProduct(deleteTarget)) {
      alert('This is a catalog demo product (shown on the website). It is not stored in the database — use Edit → Save to publish it, or duplicate to create a copy.')
      setDeleteTarget(null)
      return
    }
    await api.adminDeleteProduct(deleteTarget._id)
    setDeleteTarget(null)
    list.load()
  }

  const duplicateProduct = async (product) => {
    try {
      const form = productToForm(product)
      form.title = `${form.title} (Copy)`
      const payload = buildProductPayload(form, list.categories)
      await api.adminCreateProduct(payload)
      list.load()
    } catch (err) {
      alert(err.message)
    }
  }

  const downloadTemplate = () => {
    const csv = 'Name,SKU,Category,Price,Stock,Description\nSample Product,SKU-001,Category,999,10,Description'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'product-import-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const hasFilters = Boolean(
    list.search ||
      Object.values(list.filters).some(Boolean),
  )

  const clearFilters = () => {
    list.setSearch('')
    list.setFilters({
      category: '',
      subcategory: '',
      brand: '',
      stockStatus: '',
      status: '',
      featured: '',
      catalogSource: '',
      priceMin: '',
      priceMax: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  const catalogStats = countCatalogSources(list.products)

  return (
    <div className="prod-page">
      <header className="prod-page-header">
        <div>
          <nav className="prod-breadcrumb">
            <Link to="/admin">Admin</Link> / <span>Products</span>
          </nav>
          <h1>Product Management</h1>
          <p>
            Manage catalog products, variants, mockups, and personalization settings.
            {' '}
            <span className="prod-catalog-stats">
              {catalogStats.total} total · {catalogStats.database} in database · {catalogStats.demo} website demos
            </span>
          </p>
        </div>
        <Link to="/admin/products/new" className="prod-btn prod-btn--primary">
          <Plus size={16} /> Add Product
        </Link>
      </header>

      {list.error ? (
        <div className="prod-alert prod-alert--error">
          {list.error}
          <button type="button" className="prod-btn prod-btn--ghost" onClick={list.load}>
            Retry
          </button>
        </div>
      ) : null}

      <ProductSearchBar value={list.search} onChange={list.setSearch} />
      <ProductFilters filters={list.filters} onChange={list.setFilters} categories={list.categories} brands={list.brands} />

      <BulkActionsBar
        selectedCount={list.selected.length}
        onPublish={list.bulkPublish}
        onHide={list.bulkHide}
        onArchive={list.bulkDeactivate}
        onFeature={() => list.bulkFeature(true)}
        onExport={() => list.exportCsv(list.products.filter((p) => list.selected.includes(p._id)))}
        onRefresh={list.load}
        refreshing={list.loading}
      />

      <section className="prod-panel">
        <ProductListToolbar
          total={list.filtered.length}
          onRefresh={list.load}
          onExportCsv={() => list.exportCsv()}
          onExportExcel={() => list.exportExcel()}
          onPrint={list.printTable}
          refreshing={list.loading}
          visibleColumns={list.visibleColumns}
          onToggleColumn={toggleColumn}
        />

        <ProductTable
          products={list.paginated}
          loading={list.loading}
          selected={list.selected}
          onToggleSelect={list.toggleSelect}
          onToggleSelectAll={list.toggleSelectAll}
          visibleColumns={list.visibleColumns}
          sortKey={list.sortKey}
          sortDir={list.sortDir}
          onSort={handleSort}
          onDelete={setDeleteTarget}
          onDuplicate={duplicateProduct}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          onCreate={() => navigate('/admin/products/new')}
        />

        <ProductPagination
          page={list.page}
          totalPages={list.totalPages}
          pageSize={list.pageSize}
          onPageChange={list.setPage}
          onPageSizeChange={(size) => {
            list.setPageSize(size)
            list.setPage(1)
          }}
        />
      </section>

      <ProductImportExport onExport={() => list.exportCsv()} onDownloadTemplate={downloadTemplate} />

      <DeleteProductDialog
        open={Boolean(deleteTarget)}
        productName={deleteTarget?.title}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
