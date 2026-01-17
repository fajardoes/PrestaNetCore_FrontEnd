import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { NavigationState } from '@/types/router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export const LayoutShell = () => {
  const { user, logout, isProcessing } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [loginPromptId, setLoginPromptId] = useState<number | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((collapsed) => !collapsed)
  }, [])

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

  const contentOffsetClass = isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'

  return (
    <div className="min-h-screen transition-colors">
      <Sidebar collapsed={isSidebarCollapsed} />
      <div className={`transition-[margin] duration-200 ${contentOffsetClass}`}>
        <Topbar
          onLogoutClick={logout}
          user={user}
          isProcessing={isProcessing}
          loginPromptId={loginPromptId}
          onLoginPromptConsumed={() => setLoginPromptId(null)}
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
