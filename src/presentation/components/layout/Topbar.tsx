import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/presentation/components/theme/ThemeToggle'
import type { AuthUser } from '@/types/auth'

interface TopbarProps {
  onLogoutClick: () => void
  user: AuthUser | null
  isProcessing?: boolean
  loginPromptId?: number | null
  onLoginPromptConsumed?: () => void
  onToggleSidebar: () => void
  isSidebarCollapsed: boolean
}

const getInitials = (fullName: string) => {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export const Topbar = ({
  onLogoutClick,
  user,
  isProcessing,
  loginPromptId,
  onLoginPromptConsumed,
  onToggleSidebar,
  isSidebarCollapsed,
}: TopbarProps) => {
  const navigate = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      setIsUserMenuOpen(false)
    }
  }, [user])

  useEffect(() => {
    if (loginPromptId) {
      navigate('/auth/login')
      onLoginPromptConsumed?.()
    }
  }, [loginPromptId, navigate, onLoginPromptConsumed])

  useEffect(() => {
    if (!isUserMenuOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isUserMenuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-300 bg-white/80 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/80">
      <div
        className="flex h-16 items-center justify-between px-4 lg:px-8"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="btn-icon"
            aria-label={
              isSidebarCollapsed
                ? 'Expandir barra lateral'
                : 'Colapsar barra lateral'
            }
          >
            <SidebarToggleIcon
              collapsed={isSidebarCollapsed}
              className="h-5 w-5"
            />
          </button>
          <div>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              prestanet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Core Financiero
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                className="flex items-center gap-3 rounded-full border border-transparent bg-white/80 px-3 py-1 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:hover:bg-slate-700"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                disabled={isProcessing}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {getInitials(user.fullName)}
                </div>
                <div className="hidden text-left text-sm text-slate-700 dark:text-slate-200 sm:block">
                  <span className="block font-medium">{user.fullName}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </span>
                </div>
              </button>
              {isUserMenuOpen ? (
                <div className="absolute right-0 z-50 mt-3 w-60 rounded-xl border border-slate-300 bg-white p-4 shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-3 text-left text-sm">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                    {user.agencyName ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.agencyCode ?? ''} {user.agencyName}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      onLogoutClick()
                    }}
                    disabled={isProcessing}
                    className="btn-danger w-full justify-start gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="btn-primary shadow"
              onClick={() => setIsUserMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

const SidebarToggleIcon = ({
  collapsed,
  className,
}: {
  collapsed: boolean
  className?: string
}) => {
  if (collapsed) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

const LogoutIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 6.75V5a2 2 0 0 1 2-2h7.25A1.75 1.75 0 0 1 20 4.75v14.5A1.75 1.75 0 0 1 18.25 21H11a2 2 0 0 1-2-2v-1.75" />
    <path d="M15 12H3m0 0 3.5-3.5M3 12l3.5 3.5" />
  </svg>
)
