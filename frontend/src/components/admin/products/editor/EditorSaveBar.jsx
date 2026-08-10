import { Redo2, Save, Undo2 } from 'lucide-react'

export function EditorSaveBar({
  isDirty,
  saving,
  autoSaveStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDiscard,
  onSaveDraft,
  onPublish,
}) {
  return (
    <div className="peditor-savebar">
      <div className="peditor-savebar__left">
        {isDirty ? <span className="peditor-savebar__dirty">Unsaved changes</span> : <span>All changes saved</span>}
        {autoSaveStatus && <small>{autoSaveStatus}</small>}
      </div>
      <div className="peditor-savebar__actions">
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onUndo} disabled={!canUndo} title="Ctrl+Z">
          <Undo2 size={16} />
        </button>
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onRedo} disabled={!canRedo} title="Ctrl+Shift+Z">
          <Redo2 size={16} />
        </button>
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onDiscard} disabled={!isDirty}>
          Discard
        </button>
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onSaveDraft} disabled={saving}>
          Save draft
        </button>
        <button type="button" className="prod-btn prod-btn--primary" onClick={onPublish} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving…' : 'Publish'}
        </button>
      </div>
    </div>
  )
}
