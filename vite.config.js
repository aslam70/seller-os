import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/functions': {
        target: 'http://localhost:54321',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})