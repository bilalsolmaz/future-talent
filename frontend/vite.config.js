import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Dev server'da /api isteklerini Docker backend'e yönlendir
      // Bu sayede tarayıcıda localhost:5173 üzerinden çalışırken
      // API istekleri IIS'e değil Docker backend'e gider
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
