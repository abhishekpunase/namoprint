export function LayerManagerPanel({ form }) {
  const layers = [
    { id: 'bg', label: 'Background', visible: true, locked: false },
    { id: 'product', label: 'Product image', visible: Boolean(form.images?.[0]), locked: false },
    { id: 'frame', label: 'Mockup overlay', visible: Boolean(form.frameImage), locked: false },
    { id: 'mask', label: 'Printable mask', visible: true, locked: true },
    { id: 'photo', label: 'Customer photo area', visible: form.allowPhotoUpload, locked: false },
    { id: 'text', label: 'Text layers', visible: form.allowText, locked: false },
  ]

  return (
    <div className="peditor-layers">
      <p className="peditor-hint">Visual layer stack — drag/reorder: TODO. MockupEditor controls printable area.</p>
      <ul className="peditor-layer-list">
        {layers.map((layer) => (
          <li key={layer.id} className="peditor-layer-item">
            <span>{layer.label}</span>
            <span className={layer.visible ? 'is-on' : 'is-off'}>{layer.visible ? 'Visible' : 'Hidden'}</span>
            {layer.locked && <span className="prod-todo">Locked</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
