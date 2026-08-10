import { useState } from 'react'
import { FiUploadCloud } from 'react-icons/fi'
import { analyzeMockupFile } from '../../utils/mockupAnalyzer'
import {
  generateSmartMockupFromAnalysis,
  buildPersonalizerConfig,
  personalizerToFormPatch,
} from '../PersonalizerEngine'
import { PersonalizerStudio } from '../components/PersonalizerStudio'

/** Admin studio — frame upload triggers auto slot/mask generation */
export function PersonalizerAdminStudio({ form, onFormChange, onUploadFrame }) {
  const [analyzing, setAnalyzing] = useState(false)
  const product = {
    mockup: {
      frameImage: form.frameImage,
      canvas: { width: Number(form.canvasWidth), height: Number(form.canvasHeight) },
      photoBox: {
        x: Number(form.boxX),
        y: Number(form.boxY),
        width: Number(form.boxWidth),
        height: Number(form.boxHeight),
      },
      photoBoxes: form.photoBoxes,
    },
    defaultOptions: { personalizer: form.personalizer },
  }

  const handleFrameUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAnalyzing(true)
    try {
      const analysis = await analyzeMockupFile(file)
      const url = await onUploadFrame(file)
      if (url) {
        const smart = await generateSmartMockupFromAnalysis(analysis, url)
        const personalizer = buildPersonalizerConfig(smart)
        onFormChange(personalizerToFormPatch(personalizer, url))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAnalyzing(false)
      e.target.value = ''
    }
  }

  return (
    <div className="personalizer-admin">
      <div className="personalizer-admin__upload">
        <label className="personalizer-btn personalizer-btn--primary">
          <FiUploadCloud /> Upload PNG / SVG Frame
          <input type="file" accept="image/png,image/svg+xml,image/webp" hidden onChange={handleFrameUpload} />
        </label>
        {analyzing && <span className="personalizer-admin__status">Analyzing transparency & generating slots…</span>}
      </div>
      {form.frameImage && <PersonalizerStudio product={product} mode="admin" compact />}
    </div>
  )
}
