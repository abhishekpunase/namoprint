import { Download, Upload } from 'lucide-react'

export function OrderImportExport({ onExport, onDownloadTemplate }) {
  return (
    <section className="ord-panel ord-import-export">
      <h2>Import / Export</h2>
      <p>Export orders to CSV or download a sample import template.</p>
      <div className="ord-import-export__actions">
        <button type="button" className="ord-btn ord-btn--ghost" onClick={onExport}>
          <Download size={16} /> Export CSV
        </button>
        <button type="button" className="ord-btn ord-btn--ghost" onClick={onDownloadTemplate}>
          <Download size={16} /> Sample Template
        </button>
        <button type="button" className="ord-btn ord-btn--ghost" disabled title="TODO: import API">
          <Upload size={16} /> Import Orders (TODO)
        </button>
      </div>
    </section>
  )
}
