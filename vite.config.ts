import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const getVendorPackageName = (id: string) => {
  const normalizedId = id.replace(/\\/g, '/')
  const nodeModulesPath = normalizedId.split('node_modules/')[1]
  if (!nodeModulesPath) return 'vendor'

  const parts = nodeModulesPath.split('/')
  const packageName = parts[0]?.startsWith('@') ? `${parts[0]}-${parts[1]}` : parts[0]
  return packageName?.replace(/[^a-zA-Z0-9_-]/g, '-') || 'vendor'
}

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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'vendor-react'
          }

          if (
            id.includes('/@react-pdf/') ||
            id.includes('/pdfkit/') ||
            id.includes('/fontkit/') ||
            id.includes('/yoga-layout/')
          ) {
            return `vendor-pdf-${getVendorPackageName(id)}`
          }

          if (
            id.includes('/react-select/') ||
            id.includes('/@emotion/') ||
            id.includes('/memoize-one/')
          ) {
            return 'vendor-select'
          }

          if (
            id.includes('/react-hook-form/') ||
            id.includes('/@hookform/') ||
            id.includes('/yup/') ||
            id.includes('/zod/')
          ) {
            return 'vendor-forms'
          }

          if (id.includes('/axios/') || id.includes('/jwt-decode/')) {
            return 'vendor-api'
          }

          return `vendor-${getVendorPackageName(id)}`
        },
      },
    },
  },
})
