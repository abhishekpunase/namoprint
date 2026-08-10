import { NavLink, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { SETTINGS_SECTIONS, filterSettingsSections } from '../../../utils/settingsAdminUtils'

export function SettingsSidebar({ activeSection }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const sections = useMemo(() => filterSettingsSections(query), [query])

  const groups = useMemo(() => {
    const map = new Map()
    sections.forEach((item) => {
      if (item.external) return
      const target = item.section || item.id
      if (!map.has(item.group)) map.set(item.group, [])
      if (!map.get(item.group).some((x) => x.id === target)) {
        map.get(item.group).push({ ...item, target })
      }
    })
    return [...map.entries()]
  }, [sections])

  const handleClick = (item) => {
    if (item.external) {
      navigate(item.external)
      return
    }
    navigate(`/admin/settings/${item.target}`)
  }

  return (
    <aside className="set-sidebar">
      <div className="set-sidebar__search">
        <Search size={16} />
        <input
          type="search"
          placeholder="Search settings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <nav className="set-sidebar__nav">
        {groups.map(([group, items]) => (
          <div key={group} className="set-sidebar__group">
            <h3>{group}</h3>
            <ul>
              {items.map((item) => {
                const target = item.target
                const isActive = activeSection === target
                if (item.external) {
                  return (
                    <li key={item.id}>
                      <button type="button" className="set-sidebar__link" onClick={() => handleClick(item)}>
                        {item.label}
                      </button>
                    </li>
                  )
                }
                return (
                  <li key={item.id}>
                    <NavLink to={`/admin/settings/${target}`} className={() => `set-sidebar__link ${isActive ? 'is-active' : ''}`}>
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
