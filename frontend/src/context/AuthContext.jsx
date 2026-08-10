import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContextBase'
import { api } from '../services/api'
import { recordLoginSuccess, recordLogout } from '../utils/systemAdminUtils'

const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson('omgs_user'))
  const [token, setToken] = useState(() => localStorage.getItem('omgs_access_token'))
  const [booting, setBooting] = useState(Boolean(localStorage.getItem('omgs_refresh_token')))

  const persistSession = (payload) => {
    localStorage.setItem('omgs_access_token', payload.accessToken)
    localStorage.setItem('omgs_refresh_token', payload.refreshToken)
    localStorage.setItem('omgs_user', JSON.stringify(payload.user))
    setToken(payload.accessToken)
    setUser(payload.user)
  }

  const updateLocalUser = (nextUser) => {
    localStorage.setItem('omgs_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  useEffect(() => {
    const refreshToken = localStorage.getItem('omgs_refresh_token')
    if (!refreshToken) {
      setBooting(false)
      return
    }

    api
      .me()
      .then((payload) => {
        setUser(payload.user)
      })
      .catch(() => {
        localStorage.removeItem('omgs_access_token')
        localStorage.removeItem('omgs_refresh_token')
        localStorage.removeItem('omgs_user')
        setToken(null)
        setUser(null)
      })
      .finally(() => setBooting(false))
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      async login(credentials) {
        const payload = await api.login(credentials)
        persistSession(payload)
        return payload.user
      },
      async adminLogin(credentials) {
        const payload = await api.adminLogin(credentials)
        persistSession(payload)
        recordLoginSuccess(payload.user)
        return payload.user
      },
      async register(details) {
        const payload = await api.register(details)
        persistSession(payload)
        return payload.user
      },
      async logout() {
        const currentUser = user
        try {
          await api.logout()
        } catch {
          /* ignore */
        }
        recordLogout(currentUser)
        localStorage.removeItem('omgs_access_token')
        localStorage.removeItem('omgs_refresh_token')
        localStorage.removeItem('omgs_user')
        setToken(null)
        setUser(null)
      },
      updateLocalUser,
      async refreshProfile() {
        const payload = await api.profile()
        updateLocalUser(payload.user)
        return payload.user
      },
    }),
    [token, user, booting],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
