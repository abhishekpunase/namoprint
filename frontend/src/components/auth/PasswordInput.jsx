import { useState } from 'react'
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi'

export function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  minLength,
  required = true,
  autoComplete = 'current-password',
  id,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <label className="auth-password-field">
      <FiLock />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="auth-password-toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </label>
  )
}
