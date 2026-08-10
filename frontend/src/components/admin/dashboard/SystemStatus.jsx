import { TODO_MOCK_SYSTEM_STATUS } from '../../../data/dashboardPlaceholders'

const toneClass = {
  healthy: 'is-healthy',
  warning: 'is-warning',
  error: 'is-error',
}

export function SystemStatus() {
  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <h2>System Status</h2>
          <p className="dash-panel__todo">Partial live checks · storage/email TODO APIs</p>
        </div>
      </div>
      <ul className="dash-system-status">
        {TODO_MOCK_SYSTEM_STATUS.map((item) => (
          <li key={item.id} className={`dash-system-status__item ${toneClass[item.status] || ''}`}>
            <span className="dash-system-status__dot" aria-hidden="true" />
            <div>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </div>
            <span className="dash-system-status__label">{item.status}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
