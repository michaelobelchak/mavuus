import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    host: true,
    // The API also serves uploaded avatars and resumes from /uploads (in production the same
    // Express app serves the client, so both paths share one origin).
    proxy: {
      '/api': process.env.VITE_API_TARGET || 'http://localhost:3001',
      '/uploads': process.env.VITE_API_TARGET || 'http://localhost:3001',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large libs into named vendor chunks so the main bundle
          // stays under Vite's 500 KB warning threshold.
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['motion', 'canvas-confetti'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
