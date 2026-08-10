import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function EditorAccordion({ sections, defaultOpen = 'basic' }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="peditor-accordion">
      {sections.map((section) => {
        const isOpen = open === section.id
        return (
          <div key={section.id} className={`peditor-accordion__item ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="peditor-accordion__trigger"
              onClick={() => setOpen(isOpen ? '' : section.id)}
              aria-expanded={isOpen}
            >
              <span>{section.icon} {section.label}</span>
              <ChevronDown size={16} className="peditor-accordion__chevron" />
            </button>
            {isOpen && <div className="peditor-accordion__body">{section.content}</div>}
          </div>
        )
      })}
    </div>
  )
}
