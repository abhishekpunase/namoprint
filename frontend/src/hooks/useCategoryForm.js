import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { buildCategoryPayload, categoryToForm, emptyCategoryForm, findCategoryById } from '../utils/categoryFormUtils'

export function useCategoryForm({ categoryId, onSaved } = {}) {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyCategoryForm)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(Boolean(categoryId))
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadCategories = useCallback(async () => {
    const payload = await api.adminCategories()
    setCategories(payload.categories || [])
    return payload.categories || []
  }, [])

  const loadCategory = useCallback(async (id) => {
    setLoading(true)
    setError('')
    try {
      const cats = await loadCategories()
      const category = findCategoryById(id, cats)
      if (!category) throw new Error('Category not found')
      setForm(categoryToForm(category))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [loadCategories])

  const uploadImage = async (file) => {
    if (!file) return ''
    setUploadingImage(true)
    setError('')
    try {
      const payload = await api.uploadPhoto(file)
      return payload.asset?.url || ''
    } catch (err) {
      setError(err.message)
      return ''
    } finally {
      setUploadingImage(false)
    }
  }

  const submit = async () => {
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const payload = buildCategoryPayload(form)
      if (categoryId) {
        await api.adminUpdateCategory(categoryId, payload)
        setMessage('Category updated successfully')
      } else {
        await api.adminCreateCategory(payload)
        setMessage('Category created successfully')
      }
      onSaved?.()
      navigate('/admin/categories')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return {
    form,
    setForm,
    categories,
    loadCategories,
    loadCategory,
    loading,
    saving,
    uploadingImage,
    error,
    message,
    setError,
    uploadImage,
    submit,
  }
}
