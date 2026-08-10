import { useEffect, useState } from 'react'
import { checkApiHealth } from '../services/api'

/** Polls /health — true when API + database are ready, false when offline, null while checking. */
export function useApiHealth() {
  const [apiOnline, setApiOnline] = useState(null)

  useEffect(() => {
    let cancelled = false
    let timer

    const verify = async () => {
      const ok = await checkApiHealth()
      if (cancelled) return
      setApiOnline(ok)
      clearInterval(timer)
      timer = setInterval(verify, ok ? 60000 : 8000)
    }

    verify()

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  return apiOnline
}
