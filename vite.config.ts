import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API = 'https://waslaapi.runasp.net'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { target: API, changeOrigin: true },
      '/openapi': { target: API, changeOrigin: true },
      '/hubs': { target: API, changeOrigin: true, ws: true },
    },
  },
})
