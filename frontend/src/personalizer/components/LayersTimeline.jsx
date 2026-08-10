import { FiEye, FiEyeOff, FiLock, FiUnlock, FiCopy, FiTrash2 } from 'react-icons/fi'
import { LAYER_META } from '../constants'

export function LayersTimeline({ layerState, onToggle, onLock, onOpacity, activeLayer, onSelect }) {
  return (
    <div className="personalizer-layers-timeline">
      <div className="personalizer-layers-timeline__head">
        <span>Layers</span>
        <small>{LAYER_META.length} layers</small>
      </div>
      <div className="personalizer-layers-timeline__list">
        {LAYER_META.map((meta) => {
          const st = layerState?.[meta.id] || { visible: true, locked: false, opacity: 1 }
          const active = activeLayer === meta.id
          return (
            <div key={meta.id} className={`personalizer-layer-row ${active ? 'is-active' : ''}`} onClick={() => onSelect?.(meta.id)}>
              <button type="button" className="personalizer-layer-row__vis" onClick={(e) => { e.stopPropagation(); onToggle(meta.id) }} title={st.visible ? 'Hide' : 'Show'}>
                {st.visible !== false ? <FiEye /> : <FiEyeOff />}
              </button>
              <span className="personalizer-layer-row__label">{meta.label}</span>
              <button type="button" className="personalizer-layer-row__lock" onClick={(e) => { e.stopPropagation(); onLock(meta.id) }} title={st.locked ? 'Unlock' : 'Lock'}>
                {st.locked ? <FiLock /> : <FiUnlock />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={st.opacity ?? 1}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onOpacity(meta.id, Number(e.target.value))}
                className="personalizer-layer-row__opacity"
                title="Opacity"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TextLayersList({ textLayers, activeTextId, onSelect, onDuplicate, onRemove }) {
  if (!textLayers?.length) return null
  return (
    <div className="personalizer-text-layers">
      {textLayers.map((t) => (
        <div key={t.id} className={`personalizer-text-row ${activeTextId === t.id ? 'is-active' : ''}`} onClick={() => onSelect(t.id)}>
          <span>{t.text?.slice(0, 24) || 'Text'}</span>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(t.id) }}><FiCopy /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(t.id) }}><FiTrash2 /></button>
        </div>
      ))}
    </div>
  )
}
