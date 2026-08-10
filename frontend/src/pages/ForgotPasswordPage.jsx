import { useState } from 'react'
import { FiMail } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const payload = await api.forgotPassword({ email })
      setMessage(payload.message || 'If that email exists, a reset link has been sent.')
      if (payload.devResetUrl) {
        setMessage(`${payload.message} Dev reset link: ${payload.devResetUrl}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page ">
      <form className="auth-card " onSubmit={submit}>
        <p className="eyebrow">Password reset</p>
        <h1 className='text-2xl'>Forgot your password?</h1>
        <p>Enter your email and we will send you a reset link.</p>
        <label>
          <FiMail/>
          <input type="email" required placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        {error && <p className="form-message">{error}</p>}
        {message && <p className="form-success">{message}</p>}
        <button className="btn btn-primary full-width" disabled={loading} type="submit">
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
        <p>
          <Link className='text-red-500' to="/login">Back to login</Link>
        </p>
      </form>
    </section>
  )
}
