import {
  getCustomizationPreviewUrl,
  getCustomizationSummaryLines,
  getCustomizationSummaryText,
} from '../../utils/customizationDisplay'
import { resolveMediaUrl } from '../../utils/mediaUrl'

export function CustomizationSummary({
  customization,
  item,
  variant = 'store',
  showPreview = true,
  showTitle = true,
  compact = false,
  className = '',
}) {
  const lines = getCustomizationSummaryLines(customization)
  const previewUrl = getCustomizationPreviewUrl(item || { customization })
  const summaryText = getCustomizationSummaryText(customization)
  const hasCustomization = customization && typeof customization === 'object' && Object.keys(customization).length > 0

  if (!lines.length && !previewUrl) {
    if (!hasCustomization) return null
    if (compact) {
      return (
        <p className={`customization-summary customization-summary--compact ${className}`.trim()}>
          Custom design saved with this item.
        </p>
      )
    }
    return null
  }

  const isAdmin = variant === 'admin'
  const isChips = variant === 'chips'

  if (isChips && lines.length) {
    return (
      <ul className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
        {lines.map(({ label, value }) => (
          <li
            key={`${label}-${value}`}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
            title={`${label}: ${value}`}
          >
            <span className="shrink-0 font-medium text-slate-500">{label}:</span>
            <span className="truncate">{value}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (compact) {
    return (
      <p className={`customization-summary customization-summary--compact ${className}`.trim()}>
        {summaryText || 'Custom design saved with this item.'}
      </p>
    )
  }

  return (
    <div
      className={`customization-summary ${isAdmin ? 'ord-customization' : 'customization-summary--store'} ${className}`.trim()}
    >
      {showTitle ? <strong>{isAdmin ? 'Customization' : 'Your design'}</strong> : null}
      {showPreview && previewUrl ? (
        <div className={isAdmin ? 'ord-customization__preview' : 'customization-summary__preview'}>
          <img src={resolveMediaUrl(previewUrl)} alt="Customer design preview" />
        </div>
      ) : null}
      {lines.length ? (
        <dl className={isAdmin ? 'ord-customization__list' : 'customization-summary__list'}>
          {lines.map(({ label, value }) => (
            <div
              key={`${label}-${value}`}
              className={isAdmin ? 'ord-customization__row' : 'customization-summary__row'}
            >
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
}
