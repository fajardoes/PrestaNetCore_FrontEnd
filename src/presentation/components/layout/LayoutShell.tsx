import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useMyMenus } from '@/presentation/features/security/menus/hooks/use-my-menus'
import type { NavigationState } from '@/types/router'
import { HorizontalModuleMenu } from './HorizontalModuleMenu'
import { Topbar } from './Topbar'

export const LayoutShell = () => {
  const { user, logout, isAuthenticated, isProcessing } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [loginPromptId, setLoginPromptId] = useState<number | null>(null)
  const { menus, isLoading, error, refetch } = useMyMenus({
    enabled: isAuthenticated,
  })

  const navigationState = useMemo(() => {
    return (location.state as NavigationState | null) ?? null
  }, [location.state])

  useEffect(() => {
    if (navigationState?.requiresAuth) {
      setLoginPromptId(Date.now())
      const restState = { ...navigationState }
      delete restState.requiresAuth
      navigate(location.pathname, {
        replace: true,
        state: Object.keys(restState).length ? restState : undefined,
      })
    }
  }, [navigationState, navigate, location.pathname])

  return (
    <div className="min-h-screen transition-colors">
      <Topbar
        onLogoutClick={logout}
        user={user}
        isProcessing={isProcessing}
        loginPromptId={loginPromptId}
        onLoginPromptConsumed={() => setLoginPromptId(null)}
      />
      <HorizontalModuleMenu
        menus={menus}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
