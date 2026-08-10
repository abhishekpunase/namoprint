/** User-facing messages when API/backend is unreachable */
export function getBackendOfflineMessage() {
  if (import.meta.env.PROD) {
    return 'Server is temporarily unavailable. Please try again in a few minutes or contact support.'
  }
  return 'API server is not running. From the project root run: npm run dev'
}

export function getBackendOfflineHint() {
  if (import.meta.env.PROD) {
    return 'If you are the site owner, verify the API server and database are running on your host.'
  }
  return 'From the project root run: npm run dev — then open http://localhost:5173 and keep that terminal open.'
}
