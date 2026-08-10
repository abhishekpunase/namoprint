import { X } from 'lucide-react'
import { exportInventoryCsv } from '../../../utils/inventoryAdminUtils'
import { downloadTextFile } from '../../../utils/userAdminUtils'

export function InventoryReportsModal({ open, onClose, rows, lowStock, outOfStock }) {
  if (!open) return null

  const downloadReport = (name, data) => {
    downloadTextFile(`${name}-${new Date().toISOString().slice(0, 10)}.csv`, exportInventoryCsv(data))
  }

  return (
    <div className="inv-modal-backdrop" role="dialog" aria-modal="true">
      <div className="inv-modal inv-modal--wide">
        <header className="inv-modal__head">
          <h2>Inventory Reports</h2>
          <button type="button" className="inv-icon-btn" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="inv-reports-grid">
          <button type="button" className="inv-report-card" onClick={() => downloadReport('current-stock', rows)}>
            <strong>Current Stock Report</strong>
            <span>{rows.length} variant rows</span>
          </button>
          <button type="button" className="inv-report-card" onClick={() => downloadReport('low-stock', lowStock)}>
            <strong>Low Stock Report</strong>
            <span>{lowStock.length} items</span>
          </button>
          <button type="button" className="inv-report-card" onClick={() => downloadReport('out-of-stock', outOfStock)}>
            <strong>Out of Stock Report</strong>
            <span>{outOfStock.length} items</span>
          </button>
          <button type="button" className="inv-report-card" disabled title="TODO: movement report API">
            <strong>Movement Report</strong>
            <span>TODO</span>
          </button>
          <button type="button" className="inv-report-card" disabled title="TODO">
            <strong>Adjustment Report</strong>
            <span>Local history only</span>
          </button>
          <button type="button" className="inv-report-card" disabled title="TODO">
            <strong>Warehouse Report</strong>
            <span>TODO</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function InventoryImportModal({ open, onClose }) {
  if (!open) return null

  const template = 'Product SKU,Quantity,Warehouse\nAWP-POR-8X12-3MM,100,Main Warehouse'
  const downloadTemplate = () => {
    downloadTextFile('inventory-import-template.csv', template)
  }

  return (
    <div className="inv-modal-backdrop" role="dialog" aria-modal="true">
      <div className="inv-modal">
        <header className="inv-modal__head">
          <h2>Import Inventory</h2>
          <button type="button" className="inv-icon-btn" onClick={onClose}><X size={18} /></button>
        </header>
        <p className="inv-todo-panel">Bulk import requires a backend endpoint. Stock updates use existing product PATCH per variant.</p>
        <button type="button" className="inv-btn inv-btn--ghost" onClick={downloadTemplate}>Download Template</button>
        <button type="button" className="inv-btn inv-btn--primary" disabled>Import CSV (TODO)</button>
      </div>
    </div>
  )
}
