import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')

  // Determinar qué configuración usar basado en VITE_ENVIRONMENT
  const isLocal = env.VITE_ENVIRONMENT === 'local'
  const backendUrl = isLocal ? env.VITE_BACKEND_URL_LOCAL : env.VITE_BACKEND_URL_NETWORK

  console.log(`🚀 Modo: ${isLocal ? 'LOCAL' : 'NETWORK'}`)
  console.log(`🔗 Backend URL: ${backendUrl}`)

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT) || 5173,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})