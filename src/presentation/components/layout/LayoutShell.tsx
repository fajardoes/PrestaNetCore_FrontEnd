import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useMyMenus } from '@/presentation/features/security/menus/hooks/use-my-menus'
import {
  RecentNavigationProvider,
  useRecentNavigation,
} from '@/presentation/features/navigation/recent/hooks/use-recent-navigation'
import { RecentMenusBar } from '@/presentation/share/components/recent-menus-bar'
import type { RecentMenuItem } from '@/types/recent-menu'
import type { NavigationState } from '@/types/router'
import { HorizontalModuleMenu } from './HorizontalModuleMenu'
import { Topbar } from './Topbar'

export const LayoutShell = () => {
  const { user, logout, isAuthenticated, isProcessing } = useAuth()
  const [loginPromptId, setLoginPromptId] = useState<number | null>(null)
  const { menus, isLoading, error, isLoaded, refetch } = useMyMenus({
    enabled: isAuthenticated,
  })

  return (
    <RecentNavigationProvider
      menus={menus}
      userId={user?.id}
      enabled={isAuthenticated}
      menusReady={isLoaded && (!error || menus.length > 0)}
    >
      <LayoutContent
        error={error}
        isLoading={isLoading}
        isProcessing={isProcessing}
        loginPromptId={loginPromptId}
        logout={logout}
        menus={menus}
        onLoginPromptConsumed={() => setLoginPromptId(null)}
        onRetry={refetch}
        setLoginPromptId={setLoginPromptId}
        user={user}
      />
    </RecentNavigationProvider>
  )
}

interface LayoutContentProps {
  error: string | null
  isLoading: boolean
  isProcessing: boolean
  loginPromptId: number | null
  logout: () => Promise<void>
  menus: Parameters<typeof HorizontalModuleMenu>[0]['menus']
  onLoginPromptConsumed: () => void
  onRetry: () => void
  setLoginPromptId: (value: number | null) => void
  user: ReturnType<typeof useAuth>['user']
}

const LayoutContent = ({
  error,
  isLoading,
  isProcessing,
  loginPromptId,
  logout,
  menus,
  onLoginPromptConsumed,
  onRetry,
  setLoginPromptId,
  user,
}: LayoutContentProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    recentItems,
    activeItemId,
    isVisible: areRecentMenusVisible,
    toggleVisibility: toggleRecentMenusVisibility,
    registerVisit,
  } = useRecentNavigation()

  const handleRecentMenuSelect = useCallback(
    (item: RecentMenuItem) => {
      registerVisit(item.path)
      navigate(item.path)
    },
    [navigate, registerVisit],
  )

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
        onLoginPromptConsumed={onLoginPromptConsumed}
      />
      <div className="sticky top-14 z-30">
        <HorizontalModuleMenu
          menus={menus}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
        />
        <RecentMenusBar
          items={recentItems}
          activeItemId={activeItemId}
          isVisible={areRecentMenusVisible}
          onToggleVisibility={toggleRecentMenusVisibility}
          onSelect={handleRecentMenuSelect}
        />
      </div>
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
