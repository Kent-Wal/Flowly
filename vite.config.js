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
      }
    }
  }
})
