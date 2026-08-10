import { useState } from 'react'
import { REPORT_TYPES } from '../../../utils/analyticsAdminUtils'

export function ReportCenter({ onExport, onPrint }) {
  return (
    <section className="anl-panel">
      <h2>Report Center</h2>
      <p className="anl-todo-hint" style={{ marginBottom: 16 }}>
        Reports generated from existing admin data. PDF / email delivery: TODO.
      </p>
      <div className="anl-reports-grid">
        {REPORT_TYPES.map((report) => (
          <button
            key={report.id}
            type="button"
            className="anl-report-card"
            onClick={() => onExport(report.id, report.label)}
          >
            <strong>{report.label}</strong>
            <span>Export CSV · Print ready</span>
          </button>
        ))}
      </div>
      <div className="anl-quick-actions" style={{ marginTop: 16 }}>
        <button type="button" className="anl-btn anl-btn--ghost" onClick={onPrint}>Print Summary</button>
      </div>
    </section>
  )
}

export function ReportBuilder({ onGenerate, onSave }) {
  const [reportType, setReportType] = useState('sales')
  const [groupBy, setGroupBy] = useState('day')
  const [name, setName] = useState('')

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), reportType, groupBy, filters: {} })
    setName('')
  }

  return (
    <section className="anl-panel">
      <h2>Custom Report Builder</h2>
      <p className="anl-todo-hint" style={{ marginBottom: 16 }}>
        Build reports from available fields. Advanced grouping / scheduling: TODO — POST /admin/reports API.
      </p>
      <div className="anl-builder">
        <label>
          Report Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Monthly sales summary" />
        </label>
        <label>
          Report Type
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            {REPORT_TYPES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </label>
        <label>
          Group By
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="category">Category</option>
            <option value="product">Product</option>
          </select>
        </label>
        <div className="anl-quick-actions">
          <button type="button" className="anl-btn anl-btn--primary" onClick={() => onGenerate(reportType)}>Export CSV</button>
          <button type="button" className="anl-btn anl-btn--ghost" onClick={handleSave} disabled={!name.trim()}>Save Report</button>
        </div>
      </div>
    </section>
  )
}

export function SavedReportsPanel({ reports, onRun, onDelete }) {
  return (
    <section className="anl-panel">
      <h2>Saved Reports</h2>
      {!reports.length ? (
        <div className="anl-empty"><p>No saved reports yet</p></div>
      ) : (
        <ul className="anl-list">
          {reports.map((r) => (
            <li key={r.id}>
              <span>{r.name} · {r.reportType}</span>
              <span style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="anl-btn anl-btn--ghost" style={{ minHeight: 32, padding: '0 10px' }} onClick={() => onRun(r.reportType, r.name)}>Export</button>
                <button type="button" className="anl-btn anl-btn--ghost" style={{ minHeight: 32, padding: '0 10px' }} onClick={() => onDelete(r.id)}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="anl-todo-hint" style={{ marginTop: 12 }}>Scheduled reports (daily/weekly email): TODO — cron + email API</p>
    </section>
  )
}

export function ExportModal({ open, onClose, title, rows }) {
  if (!open) return null
  return (
    <div className="anl-modal-backdrop" onClick={onClose}>
      <div className="anl-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{rows?.length || 0} rows preview</p>
        <div className="anl-table-wrap">
          <table className="anl-table">
            <thead>
              <tr>{rows?.[0] ? Object.keys(rows[0]).map((k) => <th key={k}>{k}</th>) : null}</tr>
            </thead>
            <tbody>
              {(rows || []).slice(0, 20).map((row, i) => (
                <tr key={i}>{Object.values(row).map((v, j) => <td key={j}>{String(v ?? '')}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="anl-modal__actions">
          <button type="button" className="anl-btn anl-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
