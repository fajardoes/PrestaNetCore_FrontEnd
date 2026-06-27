import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LayoutShell } from '@/presentation/components/layout/LayoutShell'
import { SecurityRoutes } from './security-routes'
import { OrganizationRoutes } from './organization-routes'
import { ClientsRoutes } from './clients-routes'
import { AccountingRoutes } from './accounting-routes'
import { CollectionChannelsRoutes } from './collection-channels-routes'
import { LoansRoutes } from './loans-routes'
import { PaymentsRoutes } from './payments-routes'
import { SystemRoutes } from './system-routes'
import { SalesRoutes } from './sales-routes'
import { ProtectedRoute } from './ProtectedRoute'

const HomePage = lazy(() =>
  import('@/presentation/pages/HomePage').then((module) => ({
    default: module.HomePage,
  })),
)
const ForceChangePasswordPage = lazy(() =>
  import('@/presentation/features/auth/pages/force-change-password-page').then((module) => ({
    default: module.ForceChangePasswordPage,
  })),
)
const LoginPage = lazy(() =>
  import('@/presentation/features/auth/pages/login-page').then((module) => ({
    default: module.LoginPage,
  })),
)
const ResetPasswordPage = lazy(() =>
  import('@/presentation/features/auth/pages/reset-password-page').then((module) => ({
    default: module.ResetPasswordPage,
  })),
)

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-600 dark:bg-gray-950 dark:text-gray-300">
            Cargando...
          </div>
        }
      >
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
              {CollectionChannelsRoutes()}
              {LoansRoutes()}
              {PaymentsRoutes()}
              {SalesRoutes()}
              {SystemRoutes()}
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
