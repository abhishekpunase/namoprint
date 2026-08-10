import { useState } from 'react'
import { X } from 'lucide-react'

const REASONS = [
  'Manual correction',
  'Damaged goods',
  'Returned goods',
  'Purchase received',
  'Order deduction',
  'Stock count',
  'Other',
]

export function AdjustmentModal({ open, row, onClose, onSave, saving }) {
  const [mode, setMode] = useState('increase')
  const [quantity, setQuantity] = useState('1')
  const [newLevel, setNewLevel] = useState('')
  const [reason, setReason] = useState(REASONS[0])
  const [notes, setNotes] = useState('')

  if (!open || !row) return null

  const submit = async (e) => {
    e.preventDefault()
    if (mode === 'set') {
      await onSave({
        variantId: row.variantId,
        mode: 'set',
        newStock: Number(newLevel),
        reason,
        notes,
      })
    } else {
      const delta = mode === 'increase' ? Number(quantity) : -Number(quantity)
      await onSave({ variantId: row.variantId, mode, delta, reason, notes })
    }
    onClose()
  }

  return (
    <div className="inv-modal-backdrop" role="dialog" aria-modal="true">
      <div className="inv-modal">
        <header className="inv-modal__head">
          <div>
            <h2>Stock Adjustment</h2>
            <p>{row.productName} · {row.sku}</p>
          </div>
          <button type="button" className="inv-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <p className="inv-modal__current">Current stock: <strong>{row.currentStock}</strong> · Available: {row.availableStock}</p>
        {row.isDemo ? (
          <p className="inv-alert inv-alert--warn">Demo product — publish to database before updating stock via Product Editor.</p>
        ) : null}
        <form className="inv-form" onSubmit={submit}>
          <label>
            Adjustment Type
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="increase">Increase stock</option>
              <option value="decrease">Decrease stock</option>
              <option value="set">Set exact level</option>
            </select>
          </label>
          {mode === 'set' ? (
            <label>
              New stock level
              <input type="number" min={0} required value={newLevel} onChange={(e) => setNewLevel(e.target.value)} />
            </label>
          ) : (
            <label>
              Quantity
              <input type="number" min={1} required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </label>
          )}
          <label>
            Reason
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            Admin notes
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional internal note" />
          </label>
          <div className="inv-modal__actions">
            <button type="button" className="inv-btn inv-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="inv-btn inv-btn--primary" disabled={saving || row.isDemo}>
              {saving ? 'Saving…' : 'Save Adjustment'}
            </button>
          </div>
        </form>
        <p className="inv-todo-hint">Uses existing <code>PATCH /admin/products/:id</code> with updated variant stock.</p>
      </div>
    </div>
  )
}

export function TransferModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="inv-modal-backdrop" role="dialog" aria-modal="true">
      <div className="inv-modal">
        <header className="inv-modal__head">
          <h2>Transfer Stock</h2>
          <button type="button" className="inv-icon-btn" onClick={onClose}><X size={18} /></button>
        </header>
        <p className="inv-todo-panel">Warehouse transfers require multi-warehouse backend support. TODO: transfer API.</p>
        <button type="button" className="inv-btn inv-btn--ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
