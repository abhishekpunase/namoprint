import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const configDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, configDir, '')
  const apiTarget = (env.VITE_DEV_API_TARGET || 'http://localhost:5000').replace(/\/+$/, '')

  const proxyOptions = {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
    timeout: 30000,
    configure(proxy) {
      proxy.on('error', (err) => {
        console.error(`[vite] API proxy error (${apiTarget}):`, err.message)
      })
    },
  }

  console.log(`[vite] Dev API proxy: /api -> ${apiTarget}`)

  return {
    envDir: configDir,
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': proxyOptions,
        '/uploads': proxyOptions,
        '/health': proxyOptions,
      },
    },
  }
})
