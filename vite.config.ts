import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@react-pdf/renderer': fileURLToPath(
        new URL('./node_modules/@react-pdf/renderer/lib/react-pdf.browser.js', import.meta.url),
      ),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
