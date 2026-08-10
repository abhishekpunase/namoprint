import { useMemo, useState } from 'react'
import { FiCheckCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi'

/**
 * Collapsed: 2–3 lines of description.
 * Expanded: full description + highlights on the same page.
 */
export function ProductDescriptionExpandable({
  description = '',
  highlights = [],
  className = '',
  descriptionClassName = 'text-sm leading-relaxed text-slate-600',
  highlightVariant = 'list',
  collapsedLines = 3,
}) {
  const [expanded, setExpanded] = useState(false)

  const trimmedDesc = String(description || '').trim()
  const items = (highlights || []).filter(Boolean)

  const showToggle = useMemo(() => {
    if (items.length > 0) return true
    if (trimmedDesc.length > 120) return true
    if (trimmedDesc.split(/\n/).length > collapsedLines) return true
    return false
  }, [trimmedDesc, items.length, collapsedLines])

  if (!trimmedDesc && !items.length) return null

  const clampClass =
    collapsedLines === 2 ? 'line-clamp-2' : collapsedLines === 4 ? 'line-clamp-4' : 'line-clamp-3'

  return (
    <div className={className}>
      {trimmedDesc && (
        <p className={`${descriptionClassName} ${!expanded && showToggle ? clampClass : ''}`.trim()}>{trimmedDesc}</p>
      )}

      {expanded && items.length > 0 && (
        <>
          {highlightVariant === 'pills' ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-orange-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
        >
          {expanded ? (
            <>
              Show Less
              <FiChevronUp className="h-4 w-4" aria-hidden />
            </>
          ) : (
            <>
              Learn More
              <FiChevronDown className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      )}
    </div>
  )
}
