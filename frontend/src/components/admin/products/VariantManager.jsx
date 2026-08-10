import { FiPlus, FiTrash2 } from 'react-icons/fi'

export function VariantManager({ variants, onUpdate, onAdd, onRemove }) {
  return (
    <div className="prod-variants">
      <div className="prod-variants__head">
        <div>
          <h3>Product Variants</h3>
          <p>Size, material, frame, pricing and stock</p>
        </div>
        <button type="button" className="prod-btn prod-btn--ghost" onClick={onAdd}>
          <FiPlus /> Add variant
        </button>
      </div>

      <div className="prod-variants__table-wrap">
        <table className="prod-variants__table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Size</th>
              <th>Material</th>
              <th>Frame</th>
              <th>Price</th>
              <th>Sale Price</th>
              <th>Stock</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, index) => (
              <tr key={variant._id || index}>
                <td>
                  <input value={variant.sku} placeholder="Auto-generated" onChange={(e) => onUpdate(index, 'sku', e.target.value)} />
                </td>
                <td>
                  <input required value={variant.size} placeholder="8x12 inch" onChange={(e) => onUpdate(index, 'size', e.target.value)} />
                </td>
                <td>
                  <input value={variant.material} onChange={(e) => onUpdate(index, 'material', e.target.value)} />
                </td>
                <td>
                  <input value={variant.frameType} onChange={(e) => onUpdate(index, 'frameType', e.target.value)} />
                </td>
                <td>
                  <input type="number" min="0" required value={variant.price} onChange={(e) => onUpdate(index, 'price', e.target.value)} />
                </td>
                <td>
                  <input type="number" min="0" value={variant.compareAtPrice} onChange={(e) => onUpdate(index, 'compareAtPrice', e.target.value)} />
                </td>
                <td>
                  <input type="number" min="0" value={variant.stock} onChange={(e) => onUpdate(index, 'stock', e.target.value)} />
                </td>
                <td>
                  <button type="button" className="prod-icon-btn is-danger" onClick={() => onRemove(index)} disabled={variants.length === 1}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
