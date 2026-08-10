import { useCallback, useEffect, useRef, useState } from 'react'
import { useProductForm } from './useProductForm'

export function validateProductForm(form, { publishing = false } = {}) {
  const errors = []
  if (!form.title?.trim()) errors.push('Product name is required')
  if (!form.category) errors.push('Category is required')
  if (!form.variants?.some((v) => v.size && v.price !== '')) {
    errors.push('At least one variant with size and price is required')
  }
  const skus = form.variants.map((v) => v.sku).filter(Boolean)
  if (new Set(skus).size !== skus.length) errors.push('Duplicate SKU detected')
  if (publishing && form.allowPhotoUpload && !form.frameImage) {
    errors.push('Publish ke liye mockup frame upload karein (Customization & Mockup section)')
  }
  return errors
}

export function useImageUploadQueue(uploadFn) {
  const [queue, setQueue] = useState([])

  const processFile = useCallback(async (item) => {
    setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, status: 'uploading', progress: 30 } : x)))
    try {
      await uploadFn([item.file])
      setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, status: 'done', progress: 100 } : x)))
    } catch (err) {
      setQueue((q) =>
        q.map((x) => (x.id === item.id ? { ...x, status: 'error', error: err.message, progress: 0 } : x)),
      )
    }
  }, [uploadFn])

  const enqueue = useCallback(async (files) => {
    const items = Array.from(files || []).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
      progress: 0,
    }))
    setQueue((q) => [...q, ...items])
    for (const item of items) {
      await processFile(item)
    }
  }, [processFile])

  const retry = (id) => {
    const item = queue.find((x) => x.id === id)
    if (item) processFile(item)
  }

  const cancel = (id) => setQueue((q) => q.filter((x) => x.id !== id))
  const clearCompleted = () => setQueue((q) => q.filter((x) => x.status !== 'done'))

  return { queue, enqueue, retry, cancel, clearCompleted }
}

const DRAFT_KEY = (id) => `product-editor-draft-${id || 'new'}`
const MAX_HISTORY = 40

function cloneForm(form) {
  return JSON.parse(JSON.stringify(form))
}

function formsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function useProductEditor({ productId, onSaved } = {}) {
  const formApi = useProductForm({ productId, onSaved })
  const [baseline, setBaseline] = useState(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [autoSaveStatus, setAutoSaveStatus] = useState('')
  const skipHistoryRef = useRef(false)
  const saveRef = useRef(() => {})

  const isDirty = baseline ? !formsEqual(formApi.form, baseline) : Boolean(formApi.form.title)

  const pushHistory = useCallback((snapshot) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1)
      trimmed.push(cloneForm(snapshot))
      if (trimmed.length > MAX_HISTORY) trimmed.shift()
      return trimmed
    })
    setHistoryIndex((i) => Math.min(i + 1, MAX_HISTORY - 1))
  }, [historyIndex])

  const setFormWithHistory = useCallback((updater) => {
    formApi.setForm((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (!skipHistoryRef.current) pushHistory(prev)
      return next
    })
  }, [formApi, pushHistory])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const nextIndex = historyIndex - 1
    skipHistoryRef.current = true
    formApi.setForm(cloneForm(history[nextIndex]))
    skipHistoryRef.current = false
    setHistoryIndex(nextIndex)
  }, [history, historyIndex, formApi])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const nextIndex = historyIndex + 1
    skipHistoryRef.current = true
    formApi.setForm(cloneForm(history[nextIndex]))
    skipHistoryRef.current = false
    setHistoryIndex(nextIndex)
  }, [history, historyIndex, formApi])

  const persistDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY(productId), JSON.stringify(formApi.form))
      setAutoSaveStatus(`Draft saved ${new Date().toLocaleTimeString()}`)
    } catch {
      setAutoSaveStatus('Could not save draft locally')
    }
  }, [formApi.form, productId])

  useEffect(() => {
    if (!isDirty) return undefined
    const t = setTimeout(persistDraft, 15000)
    return () => clearTimeout(t)
  }, [formApi.form, isDirty, persistDraft])

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (productId) formApi.loadProduct(productId)
    else formApi.loadCategories()
  }, [productId])

  useEffect(() => {
    if (!formApi.loading && baseline === null) {
      const snap = cloneForm(formApi.form)
      setBaseline(snap)
      setHistory([snap])
      setHistoryIndex(0)
    }
  }, [formApi.loading, formApi.form, baseline])

  const savePublish = useCallback(async () => {
    const errors = validateProductForm(formApi.form, { publishing: true })
    if (errors.length) {
      formApi.setError(errors.join('. '))
      return
    }
    await formApi.submit({ isActive: true })
    localStorage.removeItem(DRAFT_KEY(productId))
    setBaseline(cloneForm(formApi.form))
  }, [formApi, productId])

  const saveDraft = useCallback(async () => {
    const errors = validateProductForm(formApi.form, { publishing: false })
    if (errors.length) {
      formApi.setError(errors.join('. '))
      return
    }
    await formApi.submit({ isActive: false })
    localStorage.removeItem(DRAFT_KEY(productId))
    setBaseline(cloneForm(formApi.form))
  }, [formApi, productId])

  saveRef.current = savePublish

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveRef.current()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  const discardChanges = () => {
    if (!baseline) return
    if (!window.confirm('Discard all unsaved changes?')) return
    skipHistoryRef.current = true
    formApi.setForm(cloneForm(baseline))
    skipHistoryRef.current = false
    localStorage.removeItem(DRAFT_KEY(productId))
  }

  return {
    ...formApi,
    setForm: setFormWithHistory,
    isDirty,
    autoSaveStatus,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    saveDraft,
    savePublish,
    discardChanges,
    persistDraft,
    validationErrors: validateProductForm(formApi.form),
  }
}
