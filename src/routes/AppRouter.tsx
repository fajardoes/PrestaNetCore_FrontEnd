import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LayoutShell } from '@/presentation/components/layout/LayoutShell'
import { HomePage } from '@/presentation/pages/HomePage'
import { ForceChangePasswordPage } from '@/presentation/features/auth/pages/force-change-password-page'
import { LoginPage } from '@/presentation/features/auth/pages/login-page'
import { ResetPasswordPage } from '@/presentation/features/auth/pages/reset-password-page'
import { SecurityRoutes } from './security-routes'
import { OrganizationRoutes } from './organization-routes'
import { ClientsRoutes } from './clients-routes'
import { AccountingRoutes } from './accounting-routes'
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
        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutShell />}>
            <Route index element={<HomePage />} />
            {SecurityRoutes()}
            {OrganizationRoutes()}
            {ClientsRoutes()}
            {AccountingRoutes()}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
