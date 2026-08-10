import { Download, Upload } from 'lucide-react'

export function CategoryImportExport({ onExport, onDownloadTemplate }) {
  return (
    <section className="cat-panel cat-import-export">
      <h2>Import / Export</h2>
      <p>Export categories to CSV or download a sample import template.</p>
      <div className="cat-import-export__actions">
        <button type="button" className="cat-btn cat-btn--ghost" onClick={onExport}>
          <Download size={16} /> Export CSV
        </button>
        <button type="button" className="cat-btn cat-btn--ghost" onClick={onDownloadTemplate}>
          <Download size={16} /> Sample Template
        </button>
        <button type="button" className="cat-btn cat-btn--ghost" disabled title="TODO: CSV import requires backend endpoint">
          <Upload size={16} /> Import CSV (TODO)
        </button>
      </div>
    </section>
  )
}
