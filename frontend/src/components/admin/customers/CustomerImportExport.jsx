import { Download, Upload, X } from 'lucide-react'

export function CustomerImportExport({ open, onClose }) {
  if (!open) return null

  const downloadTemplate = () => {
    const csv = 'Name,Email,Phone,City,Country\nSample Customer,customer@example.com,9999999999,Mumbai,India'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'customer-import-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="crm-modal-backdrop" role="dialog" aria-modal="true">
      <div className="crm-modal">
        <header className="crm-modal__head">
          <h2>Import / Export Customers</h2>
          <button type="button" className="crm-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <p className="crm-todo-hint">CSV/Excel import requires a backend API. Export uses existing user list data.</p>
        <div className="crm-modal__actions">
          <button type="button" className="crm-btn crm-btn--ghost" onClick={downloadTemplate}>
            <Download size={16} /> Download Sample Template
          </button>
          <button type="button" className="crm-btn crm-btn--primary" disabled title="TODO: POST /admin/customers/import">
            <Upload size={16} /> Import CSV (TODO)
          </button>
          <button type="button" className="crm-btn crm-btn--ghost" disabled title="TODO">Import Excel (TODO)</button>
        </div>
      </div>
    </div>
  )
}
