import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_DEV_API_TARGET || 'http://localhost:5000'
  console.log(`Vite dev server proxying API requests to: ${apiTarget}`)
  return {
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          timeout: 30000,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          timeout: 30000,
        },
        '/health': {
          target: apiTarget,
          changeOrigin: true,
          timeout: 10000,
        },
      },
    },
  }
})
