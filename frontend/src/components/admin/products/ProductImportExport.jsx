import { Download, Upload } from 'lucide-react'

export function ProductImportExport({ onExport, onDownloadTemplate }) {
  return (
    <div className="prod-import-export prod-panel">
      <div className="prod-panel__head">
        <div>
          <h2>Import / Export</h2>
          <p>Bulk product operations</p>
        </div>
      </div>
      <div className="prod-import-export__actions">
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onExport}>
          <Download size={16} /> Export CSV
        </button>
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onDownloadTemplate}>
          <Download size={16} /> Sample template
        </button>
        <label className="prod-btn prod-btn--ghost">
          <Upload size={16} /> Import CSV
          <input type="file" accept=".csv" hidden disabled />
        </label>
        <span className="prod-todo">CSV/Excel import: TODO bulk import API</span>
      </div>
    </div>
  )
}
