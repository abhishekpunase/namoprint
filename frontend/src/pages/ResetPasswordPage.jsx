import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PasswordInput } from '../components/auth/PasswordInput'
import { api } from '../services/api'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (!token) {
      setError('Invalid or missing reset token')
      return
    }
    setLoading(true)
    try {
      await api.resetPassword({ token, password })
      navigate('/login', { replace: true, state: { message: 'Password updated. Please login.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">New password</p>
        <h1>Set a new password</h1>
        <PasswordInput
          placeholder="New password"
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordInput
          placeholder="Confirm password"
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
        {error && <p className="form-message">{error}</p>}
        <button className="btn btn-primary full-width" disabled={loading || !token} type="submit">
          {loading ? 'Updating...' : 'Update password'}
        </button>
        <p>
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </section>
  )
}
