import { createContext, useContext, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Command, Search, Sparkles, X } from 'lucide-react'
import { useGlobalSearch, useKeyboardShortcuts, useAccessibility } from '../../../hooks/useGlobalSearch'
import { useAuth } from '../../../hooks/useAuth'
import { ADMIN_BRAND_NAME } from '../../../config/adminBrand'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform)

const GlobalSearchContext = createContext(null)
const AccessibilityContext = createContext(null)

function CommandPaletteInner() {
  const search = useContext(GlobalSearchContext)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const inputRef = useRef(null)

  useKeyboardShortcuts({
    onCommandPalette: () => search.setOpen(true),
    onShowShortcuts: () => search.setShortcutsOpen(true),
    onEscape: () => {
      if (search.open) search.closePalette()
      else if (search.helpOpen) search.setHelpOpen(false)
      else if (search.shortcutsOpen) search.setShortcutsOpen(false)
      else if (search.a11yOpen) search.setA11yOpen(false)
    },
  })

  useEffect(() => {
    if (!search.open) return undefined
    inputRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [search.open])

  const handleSelect = (item) => {
    search.closePalette()
    if (item.action === 'logout') {
      logout().then(() => navigate('/admin/login'))
      return
    }
    if (item.action === 'help') {
      search.setHelpOpen(true)
      return
    }
    if (item.action === 'shortcuts') {
      search.setShortcutsOpen(true)
      return
    }
    if (item.action === 'a11y') {
      search.setA11yOpen(true)
      return
    }
    if (item.path) navigate(item.path)
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      search.setActiveIndex((i) => Math.min(i + 1, search.results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      search.setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter' && search.results[search.activeIndex]) {
      event.preventDefault()
      handleSelect(search.results[search.activeIndex])
    }
  }

  if (!search.open) return null

  const hasQuery = Boolean(search.query.trim())
  const shortcutLabel = isMac ? '⌘ K' : 'Ctrl K'

  return createPortal(
    <div className="ent-cmd-root" role="presentation">
      <button type="button" className="ent-cmd-backdrop" aria-label="Close search" onClick={search.closePalette} />
      <div className="ent-cmd" role="dialog" aria-modal="true" aria-label="Global search">
        <div className="ent-cmd__head">
          <span className="ent-cmd__head-icon" aria-hidden="true">
            <Search size={20} strokeWidth={2.25} />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search products, orders, customers, pages…"
            aria-label="Search everything"
            autoComplete="off"
            spellCheck={false}
          />
          {hasQuery ? (
            <button
              type="button"
              className="ent-cmd__clear"
              aria-label="Clear search"
              onClick={() => search.setQuery('')}
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="ent-kbd ent-kbd--head">{isMac ? <Command size={12} /> : null}{shortcutLabel}</kbd>
          )}
        </div>

        <div className="ent-cmd__body">
          {search.loading ? (
            <div className="ent-cmd__empty">
              <div className="ent-cmd__empty-icon ent-cmd__empty-icon--pulse">
                <Search size={22} />
              </div>
              <p>Loading search index…</p>
            </div>
          ) : null}

          {!search.loading && !search.results.length ? (
            <div className="ent-cmd__empty">
              <div className="ent-cmd__empty-icon">
                {hasQuery ? <Search size={22} /> : <Sparkles size={22} />}
              </div>
              <p>{hasQuery ? `No results for “${search.query}”` : 'Type to search or pick a quick action below'}</p>
            </div>
          ) : null}

          {!search.loading && search.results.length ? (
            <ul className="ent-cmd__list" role="listbox">
              {search.results.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === search.activeIndex}
                    className={`ent-cmd__item ${index === search.activeIndex ? 'is-active' : ''}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => search.setActiveIndex(index)}
                  >
                    <span className="ent-cmd__type">{item.type}</span>
                    <span className="ent-cmd__text">
                      <span className="ent-cmd__title">{item.title}</span>
                      {item.subtitle ? <span className="ent-cmd__subtitle">{item.subtitle}</span> : null}
                    </span>
                    <ArrowRight size={15} className="ent-cmd__arrow" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <footer className="ent-cmd__foot">
          <div className="ent-cmd__foot-hints">
            <span className="ent-cmd__foot-item"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span className="ent-cmd__foot-item"><kbd>↵</kbd> Open</span>
            <span className="ent-cmd__foot-item"><kbd>Esc</kbd> Close</span>
          </div>
          <span className="ent-cmd__foot-brand">{ADMIN_BRAND_NAME} Admin</span>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

export function HelpCenterModal({ open, onClose }) {
  if (!open) return null

  const faqs = [
    { q: 'How do I create a product?', a: 'Press Ctrl+K, type “Create Product”, or go to Products → New.' },
    { q: 'Where are audit logs?', a: 'System Center → Audit Logs at /admin/system.' },
    { q: 'How do backups work?', a: 'Local export of admin settings until backend backup API is available.' },
    { q: 'Is dark mode supported?', a: 'Yes — toggle in the navbar or Appearance settings.' },
  ]

  return (
    <>
      <button type="button" className="ent-cmd-backdrop" onClick={onClose} aria-label="Close help" />
      <div className="ent-modal ent-modal--sheet" role="dialog" aria-labelledby="help-title">
        <div className="ent-modal__head">
          <h2 id="help-title">Help Center</h2>
          <button type="button" className="ent-icon-btn" onClick={onClose}>×</button>
        </div>
        <div className="ent-modal__body">
          <section>
            <h3>Documentation</h3>
            <p className="ent-muted">Enterprise admin panel for {ADMIN_BRAND_NAME} — all modules reuse existing MERN APIs.</p>
          </section>
          <section>
            <h3>FAQ</h3>
            <div className="ent-faq">
              {faqs.map((f) => (
                <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </section>
          <section>
            <h3>Support</h3>
            <p className="ent-muted">Contact: support@namoprints.com · WhatsApp: +91 9098570277</p>
            <button type="button" className="ent-btn ent-btn--ghost" disabled title="TODO">Send Feedback (TODO)</button>
          </section>
        </div>
      </div>
    </>
  )
}

export function ShortcutsModal({ open, onClose }) {
  if (!open) return null

  const shortcuts = [
    { keys: 'Ctrl + K', action: 'Global search / command palette' },
    { keys: 'Ctrl + /', action: 'Show keyboard shortcuts' },
    { keys: 'Esc', action: 'Close modal or drawer' },
    { keys: 'Ctrl + S', action: 'Save (contextual forms)' },
    { keys: 'Ctrl + N', action: 'New item (contextual)' },
  ]

  return (
    <>
      <button type="button" className="ent-cmd-backdrop" onClick={onClose} aria-label="Close shortcuts" />
      <div className="ent-modal" role="dialog" aria-labelledby="shortcuts-title">
        <div className="ent-modal__head">
          <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
          <button type="button" className="ent-icon-btn" onClick={onClose}>×</button>
        </div>
        <ul className="ent-shortcuts">
          {shortcuts.map((s) => (
            <li key={s.keys}><kbd>{s.keys}</kbd><span>{s.action}</span></li>
          ))}
        </ul>
      </div>
    </>
  )
}

export function AccessibilityModal({ open, onClose, prefs, onChange }) {
  if (!open) return null

  return (
    <>
      <button type="button" className="ent-cmd-backdrop" onClick={onClose} aria-label="Close accessibility" />
      <div className="ent-modal" role="dialog" aria-labelledby="a11y-title">
        <div className="ent-modal__head">
          <h2 id="a11y-title">Accessibility</h2>
          <button type="button" className="ent-icon-btn" onClick={onClose}>×</button>
        </div>
        <div className="ent-modal__body ent-a11y-form">
          <label><input type="checkbox" checked={!!prefs.reducedMotion} onChange={(e) => onChange({ reducedMotion: e.target.checked })} /> Reduced motion</label>
          <label><input type="checkbox" checked={!!prefs.highContrast} onChange={(e) => onChange({ highContrast: e.target.checked })} /> High contrast</label>
          <label><input type="checkbox" checked={prefs.focusVisible !== false} onChange={(e) => onChange({ focusVisible: e.target.checked })} /> Enhanced focus rings</label>
          <label><input type="checkbox" checked={!!prefs.screenReaderHints} onChange={(e) => onChange({ screenReaderHints: e.target.checked })} /> Screen reader hints</label>
          <label>
            Font scale ({prefs.fontScale || 100}%)
            <input type="range" min={90} max={120} value={prefs.fontScale || 100} onChange={(e) => onChange({ fontScale: Number(e.target.value) })} />
          </label>
          <p className="ent-muted">WCAG 2.2 aligned preferences — applied instantly without backend changes.</p>
        </div>
      </div>
    </>
  )
}

function GlobalSearchHost() {
  const search = useContext(GlobalSearchContext)
  const a11y = useContext(AccessibilityContext)

  return (
    <>
      <CommandPaletteInner />
      <HelpCenterModal open={search.helpOpen} onClose={() => search.setHelpOpen(false)} />
      <ShortcutsModal open={search.shortcutsOpen} onClose={() => search.setShortcutsOpen(false)} />
      <AccessibilityModal open={search.a11yOpen} onClose={() => search.setA11yOpen(false)} prefs={a11y.prefs} onChange={a11y.setPrefs} />
    </>
  )
}

export function GlobalSearchProvider({ children }) {
  const search = useGlobalSearch()
  const a11y = useAccessibility()

  return (
    <GlobalSearchContext.Provider value={search}>
      <AccessibilityContext.Provider value={a11y}>
        {children}
        <GlobalSearchHost />
      </AccessibilityContext.Provider>
    </GlobalSearchContext.Provider>
  )
}

export function useGlobalSearchContext() {
  const ctx = useContext(GlobalSearchContext)
  if (!ctx) throw new Error('useGlobalSearchContext requires GlobalSearchProvider')
  return ctx
}

export function useAccessibilityContext() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibilityContext requires GlobalSearchProvider')
  return ctx
}
