import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import {
  appendServerLog,
  buildAuditLogsFromData,
  checkSystemHealth,
  computeSecurityDashboard,
  createLocalBackup,
  deleteBackup,
  exportAuditCsv,
  getBackupHistory,
  getBackupPayload,
  getPerformanceMetrics,
  getPerfPrefs,
  getServerLogs,
  getSessions,
  matchesAuditFilters,
  matchesAuditSearch,
  restoreBackup,
  restoreBackupPreview,
  revokeAllSessions,
  revokeSession,
  savePerfPrefs,
} from '../utils/systemAdminUtils'
import { readJsonStorage } from '../utils/settingsAdminUtils'

export const FAILED_LOGINS_KEY = 'omgs_security_failed_logins'

export function useSystemCenter() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])
  const [health, setHealth] = useState(null)
  const [security, setSecurity] = useState(null)
  const [sessions, setSessions] = useState([])
  const [backups, setBackups] = useState([])
  const [serverLogs, setServerLogs] = useState([])
  const [performance, setPerformance] = useState(null)
  const [perfPrefs, setPerfPrefsState] = useState(getPerfPrefs())
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ action: '', resource: '', status: '', user: '', dateFrom: '', dateTo: '' })
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [selected, setSelected] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [ordersPayload, productsPayload, usersPayload, categoriesPayload, couponsPayload] = await Promise.all([
        api.adminOrders(),
        api.adminProducts('?limit=50'),
        api.adminUsers('?limit=50'),
        api.adminCategories(),
        api.coupons(),
      ])

      const logs = buildAuditLogsFromData({
        orders: ordersPayload.orders || [],
        products: productsPayload.products || productsPayload || [],
        users: usersPayload.users || [],
        categories: categoriesPayload.categories || categoriesPayload || [],
        coupons: Array.isArray(couponsPayload) ? couponsPayload : couponsPayload.coupons || [],
      })
      setAuditLogs(logs)
      setHealth(await checkSystemHealth(api))
      setSecurity(computeSecurityDashboard())
      setSessions(getSessions())
      setBackups(getBackupHistory())
      setServerLogs(getServerLogs())
      setPerformance(getPerformanceMetrics())
      setPerfPrefsState(getPerfPrefs())
      appendServerLog('access', 'System Center loaded')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(() => {
      checkSystemHealth(api).then(setHealth).catch(() => {})
    }, 120000)
    return () => clearInterval(interval)
  }, [load])

  const refresh = useCallback(() => {
    setRefreshing(true)
    load()
  }, [load])

  const filtered = useMemo(() => {
    let list = [...auditLogs]
    if (search.trim()) list = list.filter((l) => matchesAuditSearch(l, search))
    list = list.filter((l) => matchesAuditFilters(l, filters))
    return list
  }, [auditLogs, search, filters])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const failedLogins = useMemo(() => readJsonStorage(FAILED_LOGINS_KEY, []), [auditLogs])

  const runBackup = useCallback((type) => {
    const entry = createLocalBackup(type)
    setBackups(getBackupHistory())
    return entry
  }, [])

  const downloadBackup = useCallback((id) => {
    const raw = getBackupPayload(id)
    if (!raw) return
    const blob = new Blob([raw], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `namo-backup-${id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const restore = useCallback((id) => restoreBackup(id), [])
  const previewRestore = useCallback((id) => restoreBackupPreview(id), [])
  const removeBackup = useCallback((id) => {
    deleteBackup(id)
    setBackups(getBackupHistory())
  }, [])

  const logoutSession = useCallback((id) => {
    revokeSession(id)
    setSessions(getSessions())
  }, [])

  const logoutAll = useCallback(() => {
    revokeAllSessions()
    setSessions([])
  }, [])

  const exportCsv = useCallback(() => {
    const rows = selected.length ? filtered.filter((l) => selected.includes(l.id)) : filtered
    exportAuditCsv(rows)
  }, [filtered, selected])

  const updatePerfPrefs = useCallback((patch) => {
    const next = { ...getPerfPrefs(), ...patch }
    savePerfPrefs(next)
    setPerfPrefsState(next)
  }, [])

  return {
    loading,
    error,
    refreshing,
    auditLogs,
    filtered,
    paginated,
    total: filtered.length,
    search,
    setSearch,
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    selected,
    setSelected,
    health,
    security,
    sessions,
    failedLogins,
    backups,
    serverLogs,
    performance,
    perfPrefs,
    updatePerfPrefs,
    refresh,
    runBackup,
    downloadBackup,
    restore,
    previewRestore,
    removeBackup,
    logoutSession,
    logoutAll,
    exportCsv,
  }
}
