import { FiCheckCircle } from 'react-icons/fi'
import { PreviewFrame } from '../product/PreviewFrame'
import { fallbackProducts } from '../../data/fallbackCatalog'
import { getDefaultOptions } from '../../data/customizationTemplates'

const heroProduct = fallbackProducts[0]

export function HeroShowcase() {
  return (
    <div className="hero-showcase">
      <div className="hero-mockup-wrap">
        <PreviewFrame
          product={heroProduct}
          crop={{ scale: 1, rotate: 0 }}
          options={{ ...getDefaultOptions(heroProduct.productType), ...heroProduct.defaultOptions }}
        />
      </div>
      <div className="floating-proof">
        <FiCheckCircle />
        Live design proof
      </div>
    </div>
  )
}
