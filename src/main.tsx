import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { NotificationProvider } from '@/providers/NotificationProvider'
import { GlobalLoadingIndicator } from '@/presentation/share/components/global-loading-indicator'
import { ensureBrowserBuffer } from '@/presentation/share/utils/browser-buffer'
import App from '@/App'
import '@/index.css'

ensureBrowserBuffer()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <App />
          <GlobalLoadingIndicator />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
