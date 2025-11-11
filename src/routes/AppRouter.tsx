import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LayoutShell } from '@/presentation/components/layout/LayoutShell'
import { AboutPage } from '@/presentation/pages/AboutPage'
import { DashboardPage } from '@/presentation/pages/DashboardPage'
import { HomePage } from '@/presentation/pages/HomePage'
import { ProtectedRoute } from './ProtectedRoute'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutShell />}>
          <Route index element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
