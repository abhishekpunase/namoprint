/** Modern pill toggle — native checkbox is visually hidden; track + knob are real elements. */

export function AdminToggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className = '',
  inputProps = {},
}) {
  return (
    <label className={`admin-toggle ${className}`.trim()}>
      {(label || description) && (
        <span className="admin-toggle__copy">
          {label ? <strong>{label}</strong> : null}
          {description ? <small>{description}</small> : null}
        </span>
      )}
      <input
        id={id}
        type="checkbox"
        className="admin-toggle__input"
        checked={Boolean(checked)}
        onChange={onChange}
        disabled={disabled}
        {...inputProps}
      />
      <span className="admin-toggle__track" aria-hidden="true">
        <span className="admin-toggle__knob" />
      </span>
    </label>
  )
}

/** Toggle inside a highlighted settings card (e.g. collage enable) */
export function AdminSwitchCard(props) {
  const { className = '', ...rest } = props
  return <AdminToggle {...rest} className={`admin-switch-card ${className}`.trim()} />
}
