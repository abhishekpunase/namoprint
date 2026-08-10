import { getBackendOfflineHint, getBackendOfflineMessage } from '../../config/backendStatus'

export function AuthApiBanner({ apiOnline }) {
  if (apiOnline !== false) return null

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">{getBackendOfflineMessage()}</p>
      {!import.meta.env.PROD ? (
        <p className="mt-2 text-xs text-amber-800">{getBackendOfflineHint()}</p>
      ) : null}
    </div>
  )
}
