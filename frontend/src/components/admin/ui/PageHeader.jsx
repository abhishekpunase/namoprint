export function PageHeader({ eyebrow, title, description, actions = null, className = '' }) {
  return (
    <header className={`admin-v2-page-header ${className}`.trim()}>
      <div className="admin-v2-page-header__copy">
        {eyebrow ? <p className="admin-v2-page-header__eyebrow">{eyebrow}</p> : null}
        {title ? <h1 className="admin-v2-page-header__title">{title}</h1> : null}
        {description ? <p className="admin-v2-page-header__description">{description}</p> : null}
      </div>
      {actions ? <div className="admin-v2-page-header__actions">{actions}</div> : null}
    </header>
  )
}
