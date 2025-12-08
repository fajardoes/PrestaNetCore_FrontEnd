import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LayoutShell } from '@/presentation/components/layout/LayoutShell'
import { AboutPage } from '@/presentation/pages/AboutPage'
import { HomePage } from '@/presentation/pages/HomePage'
import { ForceChangePasswordPage } from '@/presentation/features/auth/pages/force-change-password-page'
import { LoginPage } from '@/presentation/features/auth/pages/login-page'
import { ResetPasswordPage } from '@/presentation/features/auth/pages/reset-password-page'
import { SecurityRoutes } from './security-routes'
import { OrganizationRoutes } from './organization-routes'
import { ClientsRoutes } from './clients-routes'
import { ProtectedRoute } from './ProtectedRoute'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route
          path="/auth/force-change-password"
          element={<ForceChangePasswordPage />}
        />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route element={<LayoutShell />}>
          <Route index element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route element={<ProtectedRoute />}>
            {SecurityRoutes()}
            {OrganizationRoutes()}
            {ClientsRoutes()}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
