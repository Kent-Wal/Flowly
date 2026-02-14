import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // forward /auth/* to backend running on localhost:5000
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      // forward /plaid/* to backend
      '/plaid': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      // API namespace: forward /api/* to backend and strip the prefix so backend sees /transactions, /accounts, etc.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Note: use the /api namespace for backend requests to avoid proxying SPA navigation paths.
    }
  }
})
