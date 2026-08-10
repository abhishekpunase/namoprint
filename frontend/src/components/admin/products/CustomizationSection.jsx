import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { MockupEditor } from '../MockupEditor'

export function CustomizationSection({
  form,
  setForm,
  mockupValue,
  onMockupChange,
  onUploadFrame,
  uploadingFrame,
  onLoadTemplate,
  onUpdateOptionGroup,
  onAddOptionGroup,
  onRemoveOptionGroup,
  hideMockupEditor = false,
}) {
  return (
    <div className="prod-customization">
      {!hideMockupEditor && (
        <>
          <div className="prod-step-intro">
            <h3>Product Customization</h3>
            <p>
              Manage mockup frames, printable areas, photo slots, and customer personalization settings.
              Existing designer logic is preserved.
            </p>
          </div>

          <section className="prod-subpanel">
            <h4>Mockup & printable area</h4>
            <p className="prod-subpanel__hint">PNG/SVG frame upload with auto-detected photo window</p>
            <MockupEditor
              value={mockupValue}
              onChange={onMockupChange}
              onUploadFrame={onUploadFrame}
              uploading={uploadingFrame}
            />
          </section>
        </>
      )}

      <section className="prod-subpanel">
        <h4>Customization options</h4>
        <div className="prod-subpanel__toolbar">
          <button type="button" className="prod-btn prod-btn--ghost" onClick={onLoadTemplate}>
            Load template for product type
          </button>
          <button type="button" className="prod-btn prod-btn--ghost" onClick={onAddOptionGroup}>
            <FiPlus /> Add option group
          </button>
        </div>
        {form.customizationGroups.map((group, index) => (
          <div className="prod-option-row" key={index}>
            <input placeholder="Key" value={group.key} onChange={(e) => onUpdateOptionGroup(index, 'key', e.target.value)} />
            <input placeholder="Label" value={group.label} onChange={(e) => onUpdateOptionGroup(index, 'label', e.target.value)} />
            <input
              placeholder="Values, comma separated"
              value={(group.values || []).join(', ')}
              onChange={(e) =>
                onUpdateOptionGroup(
                  index,
                  'values',
                  e.target.value.split(',').map((v) => v.trim()).filter(Boolean),
                )
              }
            />
            <button type="button" className="prod-icon-btn is-danger" onClick={() => onRemoveOptionGroup(index)}>
              <FiTrash2 />
            </button>
          </div>
        ))}
      </section>

      <section className="prod-subpanel">
        <h4>Personalization rules</h4>
        <label className="prod-check">
          <input
            type="checkbox"
            checked={form.allowPhotoUpload}
            onChange={(e) => setForm({ ...form, allowPhotoUpload: e.target.checked })}
          />
          Allow customer photo upload
        </label>
        <label>
          Max photos
          <input type="number" min="1" value={form.maxPhotos} onChange={(e) => setForm({ ...form, maxPhotos: e.target.value })} />
        </label>
        <label className="prod-check">
          <input type="checkbox" checked={form.allowText} onChange={(e) => setForm({ ...form, allowText: e.target.checked })} />
          Allow custom text
        </label>
        <label>
          Text fields (comma separated)
          <input value={form.textFields} onChange={(e) => setForm({ ...form, textFields: e.target.value })} placeholder="caption, name" />
        </label>
        <label>
          Customization instructions
          <textarea
            value={form.personalizationInstructions}
            onChange={(e) => setForm({ ...form, personalizationInstructions: e.target.value })}
            placeholder="Instructions shown to customers in the designer"
          />
        </label>
        <p className="prod-todo">3D preview assets & live preview settings: TODO when media API is available</p>
      </section>
    </div>
  )
}
