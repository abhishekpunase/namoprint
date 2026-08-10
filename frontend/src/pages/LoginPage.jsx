import { useState } from 'react'
import { FiMail } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthApiBanner } from '../components/auth/AuthApiBanner'
import { PasswordInput } from '../components/auth/PasswordInput'
import { useAuth } from '../hooks/useAuth'
import { useApiHealth } from '../hooks/useApiHealth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const apiOnline = useApiHealth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (apiOnline === false) return
    setError('')
    setSubmitting(true)
    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password })
      navigate(location.state?.from || '/account')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Welcome back</p>
        <h1 className='text-2xl font-bold'>Login to continue your design.</h1>
        <AuthApiBanner apiOnline={apiOnline} />
        <label>
          <FiMail />
          <input type="email" required placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <PasswordInput
          placeholder="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <p className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        {error && <p className="form-message">{error}</p>}
        <button
          className="btn btn-primary full-width"
          type="submit"
          disabled={submitting || apiOnline === false}
        >
          {submitting ? 'Logging in…' : 'Login'}
        </button>
        <p>
          New customer? <Link className='text-blue-500 font-semibold' to="/register">Create an account</Link>
        </p>
        <p className="auth-admin-link text-red-500">
          Store admin? <Link to="/admin/login">Admin login</Link>
        </p>
      </form>
    </section>
  )
}
