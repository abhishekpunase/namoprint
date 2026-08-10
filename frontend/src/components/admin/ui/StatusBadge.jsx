const toneMap = {
  success: 'admin-v2-badge--success',
  warning: 'admin-v2-badge--warning',
  danger: 'admin-v2-badge--danger',
  info: 'admin-v2-badge--info',
  neutral: 'admin-v2-badge--neutral',
}

export function StatusBadge({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={`admin-v2-badge ${toneMap[tone] || toneMap.neutral} ${className}`.trim()}>
      {children}
    </span>
  )
}
