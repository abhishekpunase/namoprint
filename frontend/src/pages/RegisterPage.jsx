import { useState } from 'react'
import { FiMail, FiPhone, FiUser } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { AuthApiBanner } from '../components/auth/AuthApiBanner'
import { PasswordInput } from '../components/auth/PasswordInput'
import { useAuth } from '../hooks/useAuth'
import { useApiHealth } from '../hooks/useApiHealth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const apiOnline = useApiHealth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    if (apiOnline === false) return
    setError('')
    setSubmitting(true)
    try {
      await register({ ...form, email: form.email.trim().toLowerCase() })
      navigate('/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Create account</p>
        <h1 className='text-2xl font-bold'>Save previews and checkout faster.</h1>
        <AuthApiBanner apiOnline={apiOnline} />
        <label>
          <FiUser />
          <input required placeholder="Full name" value={form.name} onChange={(event) => update('name', event.target.value)} />
        </label>
        <label>
          <FiMail />
          <input type="email" required placeholder="Email address" value={form.email} onChange={(event) => update('email', event.target.value)} />
        </label>
        <label>
          <FiPhone />
          <input required placeholder="Phone number" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
        </label>
        <PasswordInput
          placeholder="Password"
          minLength={8}
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => update('password', event.target.value)}
        />
        {error && <p className="form-message">{error}</p>}
        <button
          className="btn btn-primary full-width"
          type="submit"
          disabled={submitting || apiOnline === false}
        >
          {submitting ? 'Creating account…' : 'Register'}
        </button>
        <p>
          Already registered? <Link className='text-red-500' to="/login">Login</Link>
        </p>
      </form>
    </section>
  )
}
