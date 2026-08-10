import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { useSettingsStore } from './useSettingsStore'
import {
  buildNotificationsFromData,
  computeNotificationDashboard,
  exportNotificationsCsv,
  getActivity,
  getAnnouncements,
  getAutomationRules,
  getEmailDrafts,
  getSentMessages,
  markAllAsRead,
  markAsRead,
  matchesNotificationFilters,
  matchesNotificationSearch,
  matchesNotificationTab,
  recordPush,
  recordSentEmail,
  recordSentSms,
  saveAnnouncement,
  saveAutomationRules,
  saveEmailDraft,
  togglePin,
} from '../utils/notificationAdminUtils'

export function useNotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [filters, setFilters] = useState({ type: '', priority: '', status: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [emailDrafts, setEmailDrafts] = useState(getEmailDrafts())
  const [sent, setSent] = useState(getSentMessages())
  const [announcements, setAnnouncements] = useState(getAnnouncements())
  const [automation, setAutomation] = useState(getAutomationRules())
  const [activity, setActivity] = useState(getActivity())
  const settings = useSettingsStore()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [dash, ordersPayload, usersPayload] = await Promise.all([
        api.adminDashboard(),
        api.adminOrders(),
        api.adminUsers('?limit=50'),
      ])

      const built = buildNotificationsFromData({
        orders: ordersPayload.orders || [],
        users: usersPayload.users || [],
        lowStock: dash.lowStockProducts || [],
        dashboard: dash,
      })
      setNotifications(built)
      setEmailDrafts(getEmailDrafts())
      setSent(getSentMessages())
      setAnnouncements(getAnnouncements())
      setAutomation(getAutomationRules())
      setActivity(getActivity())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const refresh = useCallback(() => {
    setRefreshing(true)
    load()
  }, [load])

  const filtered = useMemo(() => {
    let list = [...notifications]
    list = list.filter((n) => matchesNotificationTab(n, tab))
    if (search.trim()) list = list.filter((n) => matchesNotificationSearch(n, search))
    list = list.filter((n) => matchesNotificationFilters(n, filters))
    return list
  }, [notifications, tab, search, filters])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const dashboard = useMemo(() => computeNotificationDashboard(notifications, sent), [notifications, sent])

  const unreadCount = dashboard.unread

  const readNotification = useCallback((id) => {
    markAsRead(id)
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)))
    setActivity(getActivity())
  }, [])

  const readAll = useCallback(() => {
    markAllAsRead(notifications.map((n) => n.id))
    setNotifications((list) => list.map((n) => ({ ...n, unread: false })))
    setActivity(getActivity())
  }, [notifications])

  const pinNotification = useCallback((id) => {
    togglePin(id)
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, important: !n.pinned } : n)),
    )
  }, [])

  const toggleSelect = useCallback((id) => {
    setSelected((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }, [])

  const bulkMarkRead = useCallback(() => {
    selected.forEach(markAsRead)
    setNotifications((list) =>
      list.map((n) => (selected.includes(n.id) ? { ...n, unread: false } : n)),
    )
    setSelected([])
    setActivity(getActivity())
  }, [selected])

  const sendEmail = useCallback((email) => {
    recordSentEmail(email)
    setSent(getSentMessages())
    setActivity(getActivity())
  }, [])

  const queueSms = useCallback((sms) => {
    recordSentSms(sms)
    setSent(getSentMessages())
    setActivity(getActivity())
  }, [])

  const schedulePush = useCallback((push) => {
    recordPush(push)
    setSent(getSentMessages())
    setActivity(getActivity())
  }, [])

  const createAnnouncement = useCallback((data) => {
    const ann = saveAnnouncement(data)
    setAnnouncements(getAnnouncements())
    return ann
  }, [])

  const updateAutomation = useCallback((rules) => {
    saveAutomationRules(rules)
    setAutomation(rules)
  }, [])

  const saveDraft = useCallback((draft) => {
    const saved = saveEmailDraft(draft)
    setEmailDrafts(getEmailDrafts())
    return saved
  }, [])

  const exportCsv = useCallback(() => {
    const rows = selected.length ? filtered.filter((n) => selected.includes(n.id)) : filtered
    exportNotificationsCsv(rows)
  }, [filtered, selected])

  return {
    notifications,
    filtered,
    paginated,
    total: filtered.length,
    loading,
    error,
    refreshing,
    tab,
    setTab,
    search,
    setSearch,
    filters,
    setFilters,
    selected,
    setSelected,
    page,
    setPage,
    pageSize,
    setPageSize,
    dashboard,
    unreadCount,
    emailDrafts,
    sent,
    announcements,
    automation,
    activity,
    notificationPrefs: settings.settings.notifications,
    updateNotificationPrefs: (p) => settings.updateSection('notifications', p),
    load,
    refresh,
    readNotification,
    readAll,
    pinNotification,
    toggleSelect,
    bulkMarkRead,
    sendEmail,
    queueSms,
    schedulePush,
    createAnnouncement,
    updateAutomation,
    saveDraft,
    exportCsv,
  }
}

export function useNotificationBell() {
  const [unread, setUnread] = useState(0)
  const [preview, setPreview] = useState([])

  const load = useCallback(async () => {
    try {
      const [dash, ordersPayload, usersPayload] = await Promise.all([
        api.adminDashboard(),
        api.adminOrders(),
        api.adminUsers('?limit=20'),
      ])
      const built = buildNotificationsFromData({
        orders: (ordersPayload.orders || []).slice(0, 15),
        users: usersPayload.users || [],
        lowStock: (dash.lowStockProducts || []).slice(0, 5),
        dashboard: dash,
      })
      setPreview(built.slice(0, 8))
      setUnread(built.filter((n) => n.unread).length)
    } catch {
      setPreview([])
      setUnread(0)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [load])

  return { unread, preview, reload: load, markRead: markAsRead }
}
