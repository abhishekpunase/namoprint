import { LAYER_IDS } from '../constants'

const LAYER_LABELS = {
  [LAYER_IDS.BACKGROUND]: 'Background',
  [LAYER_IDS.CUSTOMER_IMAGE]: 'Customer Image',
  [LAYER_IDS.MASK]: 'Mask',
  [LAYER_IDS.OVERLAY]: 'Overlay',
  [LAYER_IDS.REFLECTION]: 'Reflection',
  [LAYER_IDS.SHADOW]: 'Shadow',
  [LAYER_IDS.FRAME]: 'Frame',
  [LAYER_IDS.TEXT]: 'Text',
}

export function SmartMockupLayersPanel({ layerVisibility, onToggle }) {
  return (
    <div className="smart-mockup-layers rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Layers</p>
      <ul className="space-y-1">
        {Object.entries(LAYER_LABELS).map(([id, label]) => (
          <li key={id}>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
              <input
                type="checkbox"
                checked={layerVisibility[id] !== false}
                onChange={() => onToggle(id)}
              />
              {label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
