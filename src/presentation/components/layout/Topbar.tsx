import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoDark from '@/assets/logo_dark.svg'
import logoLight from '@/assets/logo_light.svg'
import { ThemeToggle } from '@/presentation/components/theme/ThemeToggle'
import { BusinessDateIndicator } from '@/presentation/components/topbar/business-date-indicator'
import type { AuthUser } from '@/types/auth'

interface TopbarProps {
  onLogoutClick: () => void
  user: AuthUser | null
  isProcessing?: boolean
  loginPromptId?: number | null
  onLoginPromptConsumed?: () => void
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between gap-3 px-4 lg:px-8">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          aria-label="Ir al inicio de PrestaNet"
        >
          <img src={logoLight} alt="" className="h-8 w-8 dark:hidden" />
          <img src={logoDark} alt="" className="hidden h-8 w-8 dark:block" />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              prestanet
            </span>
            <span className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">
              Core Financiero
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {user ? <BusinessDateIndicator /> : null}
          <ThemeToggle />
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-md border border-transparent bg-transparent px-2 py-1 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-transparent dark:hover:bg-slate-800"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                disabled={isProcessing}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
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
                <div className="absolute right-0 z-50 mt-2 w-60 rounded-lg border border-slate-200 bg-white p-3 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900">
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
