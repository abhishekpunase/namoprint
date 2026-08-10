export function SettingsPanel({ title, description, children, actions, todo }) {
  return (
    <section className="set-panel">
      <header className="set-panel__head">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
          {todo ? <p className="set-todo">{todo}</p> : null}
        </div>
        {actions ? <div className="set-panel__actions">{actions}</div> : null}
      </header>
      <div className="set-panel__body">{children}</div>
    </section>
  )
}

export function SettingsField({ label, hint, children, required }) {
  return (
    <label className="set-field">
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

export function SettingsGrid({ children, cols = 2 }) {
  return <div className={`set-grid set-grid--${cols}`}>{children}</div>
}

export function SettingsToggle({ label, description, checked, onChange, disabled }) {
  return (
    <div className="set-toggle">
      <div>
        <strong>{label}</strong>
        {description ? <p>{description}</p> : null}
      </div>
      <button
        type="button"
        className={`set-switch ${checked ? 'is-on' : ''}`}
        aria-pressed={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  )
}

export function SettingsReadOnlyBadge({ label, value, configured }) {
  return (
    <div className="set-readonly">
      <span>{label}</span>
      <strong>{value}</strong>
      <em className={configured ? 'is-ok' : 'is-muted'}>{configured ? 'Configured' : 'Not configured'}</em>
    </div>
  )
}

export function SettingsAlert({ type = 'info', children }) {
  return <div className={`set-alert set-alert--${type}`}>{children}</div>
}
