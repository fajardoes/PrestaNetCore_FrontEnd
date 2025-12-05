import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface SidebarProps {
  collapsed: boolean
}

const HomeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 9.5 12 3l9 6.5" />
    <path d="M5 10v9h5v-5h4v5h5v-9" />
  </svg>
)

const InfoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

const SecurityIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="M8.5 12.5l2.5 2.5 4.5-4.5" />
  </svg>
)

const OrganizationIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10.5 22v-6h3v6" />
    <path d="M6 22v-6h12v6" />
    <path d="M2 22h20" />
    <path d="M12 16V2l7 4v4h-4v2" />
    <path d="M6 12V6l6-4" />
  </svg>
)

export const Sidebar = ({ collapsed }: SidebarProps) => {
  const { user } = useAuth()
  const sidebarWidth = collapsed ? 'w-20' : 'w-64'
  const [isSecurityOpen, setIsSecurityOpen] = useState(true)
  const [isOrganizationOpen, setIsOrganizationOpen] = useState(true)

  const isAdmin =
    user?.roles?.some((role) => role?.toLowerCase() === 'admin') ?? false

  const navigation = [
    { to: '/', label: 'Inicio', icon: HomeIcon },
    { to: '/about', label: 'Acerca de', icon: InfoIcon },
  ]

  const securityNav = isAdmin
    ? [
        {
          to: '/security/users',
          label: 'Usuarios',
          icon: SecurityIcon,
        },
      ]
    : []

  const organizationNav = isAdmin
    ? [
        {
          to: '/organization/agencies',
          label: 'Agencias',
          icon: OrganizationIcon,
        },
      ]
    : []

  return (
    <aside
      className={`fixed inset-y-0 hidden transform bg-sidebar text-slate-100 transition-[width] duration-200 lg:flex lg:flex-col ${sidebarWidth}`}
    >
      <div
        className={`flex items-center ${
          collapsed ? 'justify-center' : 'justify-start px-6'
        } py-6`}
      >
        {collapsed ? (
          <span className="text-xl font-bold uppercase tracking-wide">M</span>
        ) : (
          <div className="flex flex-col">
            <span className="text-xl font-bold uppercase tracking-wide">
              prestanet
            </span>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) => {
              const baseClasses =
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-slate-700 hover:text-white'
              const collapsedClasses = collapsed
                ? 'flex-col gap-2 px-2 py-3 text-xs'
                : ''
              const activeClasses = isActive
                ? 'bg-slate-100 text-sidebar'
                : 'text-slate-200'
              return [baseClasses, collapsedClasses, activeClasses].join(' ')
            }}
            end={item.to === '/'}
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            {!collapsed ? <span>{item.label}</span> : null}
          </NavLink>
        ))}

        {securityNav.length ? (
          <div className="mt-4 space-y-1">
            <button
              type="button"
              onClick={() => setIsSecurityOpen((open) => !open)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-slate-700/60 ${
                collapsed ? 'flex-col gap-1 text-center' : 'text-slate-500'
              }`}
            >
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <SecurityIcon className="h-4 w-4" />
                {!collapsed ? 'Seguridad' : null}
              </span>
              <ChevronIcon
                className={`h-3 w-3 text-slate-500 transition-transform ${
                  isSecurityOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            {isSecurityOpen
              ? securityNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={({ isActive }) => {
                      const baseClasses =
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-slate-700 hover:text-white'
                      const collapsedClasses = collapsed
                        ? 'flex-col gap-2 px-2 py-3 text-xs'
                        : ''
                      const nestedClasses = collapsed
                        ? ''
                        : 'ml-2 border-l border-slate-700/40 pl-4'
                      const activeClasses = isActive
                        ? 'bg-slate-100 text-sidebar'
                        : 'text-slate-200'
                      return [
                        baseClasses,
                        collapsedClasses,
                        nestedClasses,
                        activeClasses,
                      ].join(' ')
                    }}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </NavLink>
                ))
              : null}
          </div>
        ) : null}

        {organizationNav.length ? (
          <div className="mt-4 space-y-1">
            <button
              type="button"
              onClick={() => setIsOrganizationOpen((open) => !open)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-slate-700/60 ${
                collapsed ? 'flex-col gap-1 text-center' : 'text-slate-500'
              }`}
            >
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <OrganizationIcon className="h-4 w-4" />
                {!collapsed ? 'Organización' : null}
              </span>
              <ChevronIcon
                className={`h-3 w-3 text-slate-500 transition-transform ${
                  isOrganizationOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            {isOrganizationOpen
              ? organizationNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={({ isActive }) => {
                      const baseClasses =
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-slate-700 hover:text-white'
                      const collapsedClasses = collapsed
                        ? 'flex-col gap-2 px-2 py-3 text-xs'
                        : ''
                      const nestedClasses = collapsed
                        ? ''
                        : 'ml-2 border-l border-slate-700/40 pl-4'
                      const activeClasses = isActive
                        ? 'bg-slate-100 text-sidebar'
                        : 'text-slate-200'
                      return [
                        baseClasses,
                        collapsedClasses,
                        nestedClasses,
                        activeClasses,
                      ].join(' ')
                    }}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </NavLink>
                ))
              : null}
          </div>
        ) : null}
      </nav>
    </aside>
  )
}

const ChevronIcon = ({ className }: { className?: string }) => (
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
    <path d="m15 18-6-6 6-6" />
  </svg>
)
