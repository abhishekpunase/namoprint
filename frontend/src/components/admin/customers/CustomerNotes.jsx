import { useState } from 'react'
import { Pin, Trash2 } from 'lucide-react'
import { formatCustomerDate } from '../../../utils/customerAdminUtils'

export function CustomerNotes({ notes, onAdd, onDelete }) {
  const [text, setText] = useState('')
  const [pinned, setPinned] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text.trim(), pinned)
    setText('')
    setPinned(false)
  }

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <section className="crm-panel">
      <h2>Internal Notes</h2>
      <p className="crm-todo-hint">Private notes stored locally until backend notes API exists.</p>
      <form className="crm-notes-form" onSubmit={submit}>
        <textarea rows={3} placeholder="Add a private note about this customer…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="crm-notes-form__actions">
          <label><input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} /> Pin note</label>
          <button type="submit" className="crm-btn crm-btn--primary">Add Note</button>
        </div>
      </form>
      {!sorted.length ? (
        <p className="crm-empty-inline">No notes yet</p>
      ) : (
        <ul className="crm-notes-list">
          {sorted.map((note) => (
            <li key={note.id} className={note.pinned ? 'is-pinned' : ''}>
              <div className="crm-notes-list__head">
                <strong>{note.author}</strong>
                <time>{formatCustomerDate(note.createdAt)}</time>
                {note.pinned ? <Pin size={14} /> : null}
                <button type="button" className="crm-icon-btn" onClick={() => onDelete(note.id)} aria-label="Delete note"><Trash2 size={14} /></button>
              </div>
              <p>{note.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function ActivityTimeline({ events = [] }) {
  const TYPE_ICONS = {
    account: '👤',
    login: '🔐',
    order: '📦',
    review: '⭐',
    wishlist: '❤️',
    profile: '✏️',
  }

  return (
    <section className="crm-panel">
      <h2>Activity Timeline</h2>
      {!events.length ? (
        <p className="crm-empty-inline">No activity recorded</p>
      ) : (
        <ol className="crm-timeline">
          {events.map((event) => (
            <li key={event.id} className={`crm-timeline__item crm-timeline__item--${event.type}`}>
              <span className="crm-timeline__icon">{TYPE_ICONS[event.type] || '•'}</span>
              <div>
                <strong>{event.title}</strong>
                <p>{event.description}</p>
                <time>{formatCustomerDate(event.timestamp)}</time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
