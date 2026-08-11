import { useEffect, useState } from 'react'
import { FiLock, FiMail, FiShield } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../../components/layout/BrandLogo'
import { useAuth } from '../../hooks/useAuth'
import { recordLoginFailure } from '../../utils/systemAdminUtils'
import { checkApiHealth } from '../../services/api'
import { getBackendOfflineHint, getBackendOfflineMessage } from '../../config/backendStatus'
import { ADMIN_BRAND_NAME, ADMIN_BRAND_TAGLINE } from '../../config/adminBrand'

const DEFAULT_ADMIN_EMAIL = 'admin@omgs.com'

export function AdminLoginPage() {
  const { adminLogin, user, isAdmin, booting } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: DEFAULT_ADMIN_EMAIL, password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [apiOnline, setApiOnline] = useState(null)
  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1'
  const customerSession = location.state?.reason === 'admin_required'
  const returnPath = location.state?.from || new URLSearchParams(location.search).get('from') || '/admin'

  useEffect(() => {
    let cancelled = false
    let timer

    const verify = async () => {
      const ok = await checkApiHealth()
      if (cancelled) return
      setApiOnline(ok)
      clearInterval(timer)
      timer = setInterval(verify, ok ? 60000 : 10000)
    }

    verify()

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (booting || !isAdmin) return
    navigate(returnPath.startsWith('/admin') ? returnPath : '/admin', { replace: true })
  }, [booting, isAdmin, navigate, returnPath])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (apiOnline === false) return
    setSubmitting(true)
    try {
      await adminLogin(form)
      navigate(returnPath.startsWith('/admin') ? returnPath : '/admin')
    } catch (err) {
      recordLoginFailure(form.email)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (booting || isAdmin) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400">
        <p className="rounded-xl bg-white/90 px-6 py-4 text-sm font-medium text-gray-700 shadow-lg">
          {isAdmin ? 'Opening admin dashboard…' : 'Loading…'}
        </p>
      </section>
    )
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 px-4 py-10">
  
      {/* Background Blur */}
      <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-white/20 blur-3xl"></div>
      <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-white/20 blur-3xl"></div>
  
      <div className="relative w-full max-w-md">
  
        {/* Card */}
        <form
          onSubmit={submit}
          className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Logo */}
          <div className="flex justify-center">
            <BrandLogo imgClassName="h-14 w-auto object-contain" />
          </div>

          {/* Icon */}
          <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-500 shadow-lg">
            <FiShield size={38} />
          </div>
  
          {/* Heading */}
          <div className="mt-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
              Secure Admin Access
            </p>
  
            <h1 className="mt-2 text-3xl font-bold text-gray-800">
              Admin Login
            </h1>
  
            <p className="mt-2 text-sm text-gray-500">
              Sign in to manage orders, products and customers.
            </p>
          </div>
  
          {/* Email */}
          <div className="mt-8">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>
  
            <div className="flex items-center rounded-xl border border-gray-300 bg-white px-4 focus-within:border-orange-500">
              <FiMail className="text-gray-400" />
  
              <input
                type="email"
                required
                placeholder="admin@omgs.com"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full bg-transparent px-3 py-4 outline-none"
              />
            </div>
          </div>
  
          {/* Password */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
  
            <div className="flex items-center rounded-xl border border-gray-300 bg-white px-4 focus-within:border-orange-500">
              <FiLock className="text-gray-400" />
  
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="w-full bg-transparent px-3 py-4 outline-none"
              />
            </div>
          </div>
  
          {/* Session expired notice */}
          {sessionExpired ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your session expired. Please login again to continue editing.
            </div>
          ) : null}

          {customerSession ? (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              You are signed in as <strong>{user?.email || 'customer'}</strong>. Use admin credentials below to
              access the dashboard.
            </div>
          ) : null}

          {apiOnline === false ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {getBackendOfflineMessage()}
              {!import.meta.env.PROD ? (
                <p className="mt-2 text-xs text-amber-800">{getBackendOfflineHint()}</p>
              ) : null}
            </div>
          ) : null}

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
  
          {/* Button */}
          <button
            type="submit"
            disabled={submitting || apiOnline === false}
            className="mt-8 flex w-full items-center justify-center rounded-xl bg-orange-500 py-4 text-lg font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FiShield className="mr-2" />
            {submitting ? 'Signing in…' : 'Login to Dashboard'}
          </button>
  
          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-gray-300"></div>
            <span className="mx-4 text-sm text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>
  
          {/* Back */}
          <Link
            to="/"
            className="block text-center font-medium text-orange-500 transition hover:text-orange-600"
          >
            ← Back to Store
          </Link>
        </form>
  
        {/* Footer */}
        <p className="mt-6 text-center text-sm text-white">
          © 2026 {ADMIN_BRAND_NAME} {ADMIN_BRAND_TAGLINE}
        </p>
      </div>
    </section>
  );
}
