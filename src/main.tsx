import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { GlobalLoadingIndicator } from '@/presentation/share/components/global-loading-indicator'
import App from '@/App'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <GlobalLoadingIndicator />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
