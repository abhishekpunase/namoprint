import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  ROLES_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  appendActivityLog,
  buildDefaultPermissions,
  deepMergeSettings,
  readJsonStorage,
  writeJsonStorage,
} from '../utils/settingsAdminUtils'
import { DEFAULT_ROLES } from '../utils/settingsAdminUtils'

export function useSettingsStore() {
  const [settings, setSettings] = useState(() => readJsonStorage(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS))
  const [roles, setRoles] = useState(() => {
    const stored = readJsonStorage(ROLES_STORAGE_KEY, null)
    if (stored) return stored
    const initial = {}
    DEFAULT_ROLES.forEach((role) => {
      initial[role.id] = buildDefaultPermissions(role.id)
    })
    writeJsonStorage(ROLES_STORAGE_KEY, initial)
    return initial
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)

  const updateSection = useCallback((section, patch) => {
    setSettings((current) => ({
      ...current,
      [section]: { ...(current[section] || {}), ...patch },
    }))
    setDirty(true)
  }, [])

  const saveSettings = useCallback(async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      writeJsonStorage(SETTINGS_STORAGE_KEY, settings)
      appendActivityLog({
        type: 'settings',
        action: 'Settings saved',
        detail: 'Store settings updated (local draft — TODO: backend API)',
        user: 'Admin',
      })
      setDirty(false)
      setMessage('Settings saved locally. TODO: Connect to backend settings API.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [settings])

  const discardChanges = useCallback(() => {
    setSettings(readJsonStorage(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS))
    setDirty(false)
    setMessage('Changes discarded.')
  }, [])

  const resetSection = useCallback((section) => {
    setSettings((current) => ({
      ...current,
      [section]: DEFAULT_SETTINGS[section],
    }))
    setDirty(true)
  }, [])

  const updateRolePermissions = useCallback((roleId, module, action, value) => {
    setRoles((current) => {
      const next = {
        ...current,
        [roleId]: {
          ...(current[roleId] || buildDefaultPermissions(roleId)),
          [module]: {
            ...(current[roleId]?.[module] || {}),
            [action]: value,
          },
        },
      }
      writeJsonStorage(ROLES_STORAGE_KEY, next)
      return next
    })
    appendActivityLog({
      type: 'permission',
      action: 'Permission updated',
      detail: `${roleId}: ${module}.${action} = ${value}`,
      user: 'Admin',
    })
  }, [])

  const copyRolePermissions = useCallback((fromId, toId) => {
    setRoles((current) => {
      const next = { ...current, [toId]: { ...current[fromId] } }
      writeJsonStorage(ROLES_STORAGE_KEY, next)
      return next
    })
    appendActivityLog({
      type: 'permission',
      action: 'Role copied',
      detail: `Permissions copied from ${fromId} to ${toId}`,
      user: 'Admin',
    })
  }, [])

  const duplicateRole = useCallback((roleId, newName) => {
    const id = `${newName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    setRoles((current) => {
      const next = { ...current, [id]: { ...current[roleId] } }
      writeJsonStorage(ROLES_STORAGE_KEY, next)
      return next
    })
    return id
  }, [])

  useEffect(() => {
    if (!dirty) return undefined
    const timer = setTimeout(() => {
      writeJsonStorage(SETTINGS_STORAGE_KEY, settings)
    }, 15000)
    return () => clearTimeout(timer)
  }, [settings, dirty])

  const merged = useMemo(() => deepMergeSettings(DEFAULT_SETTINGS, settings), [settings])

  return {
    settings: merged,
    roles,
    roleDefinitions: DEFAULT_ROLES,
    saving,
    message,
    error,
    dirty,
    setMessage,
    setError,
    updateSection,
    saveSettings,
    discardChanges,
    resetSection,
    updateRolePermissions,
    copyRolePermissions,
    duplicateRole,
  }
}

export function useActivityLogs() {
  const [logs, setLogs] = useState(() => readJsonStorage('omgs_admin_activity_logs', []))

  const refresh = useCallback(() => {
    setLogs(readJsonStorage('omgs_admin_activity_logs', []))
  }, [])

  const clearLogs = useCallback(() => {
    writeJsonStorage('omgs_admin_activity_logs', [])
    setLogs([])
  }, [])

  return { logs, refresh, clearLogs }
}
