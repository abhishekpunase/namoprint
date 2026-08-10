import { useMemo, useState } from 'react'
import { DesignContext } from './DesignContextBase'
import { api } from '../services/api'

export function DesignProvider({ children }) {
  const [design, setDesign] = useState({
    asset: null,
    photoUrl: '',
    preview: null,
    crop: { x: 0, y: 0, width: 1, height: 1, rotate: 0, scale: 1 },
    text: {},
    notes: '',
  })

  const value = useMemo(
    () => ({
      design,
      setCrop(crop) {
        setDesign((current) => ({ ...current, crop: { ...current.crop, ...crop } }))
      },
      setText(name, value) {
        setDesign((current) => ({ ...current, text: { ...current.text, [name]: value } }))
      },
      setNotes(notes) {
        setDesign((current) => ({ ...current, notes }))
      },
      async uploadPhoto(file) {
        const localUrl = URL.createObjectURL(file)
        try {
          const payload = await api.uploadPhoto(file)
          setDesign((current) => ({ ...current, asset: payload.asset, photoUrl: payload.asset.previewUrl || localUrl }))
          return payload.asset
        } catch {
          const asset = { _id: `local-${Date.now()}`, previewUrl: localUrl }
          setDesign((current) => ({ ...current, asset, photoUrl: localUrl }))
          return asset
        }
      },
      async buildPreview(product) {
        if (!design.asset) return null
        try {
          const payload = await api.preview({
            productId: product._id,
            assetId: design.asset._id,
            crop: design.crop,
          })
          setDesign((current) => ({ ...current, preview: payload.preview }))
          return payload.preview
        } catch {
          const preview = {
            canvas: product.mockup?.canvas,
            photoBox: product.mockup?.photoBox,
            imageUrl: design.photoUrl,
          }
          setDesign((current) => ({ ...current, preview }))
          return preview
        }
      },
      reset() {
        setDesign({
          asset: null,
          photoUrl: '',
          preview: null,
          crop: { x: 0, y: 0, width: 1, height: 1, rotate: 0, scale: 1 },
          text: {},
          notes: '',
        })
      },
    }),
    [design],
  )

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
}
