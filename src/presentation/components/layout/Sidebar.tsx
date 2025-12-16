import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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

const LocationIcon = ({ className }: { className?: string }) => (
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
    <path d="M12 21s-6-5.14-6-11a6 6 0 1 1 12 0c0 5.86-6 11-6 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

const ClientsIcon = ({ className }: { className?: string }) => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const CatalogsIcon = ({ className }: { className?: string }) => (
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
    <path d="M5 4h14" />
    <path d="M5 8h14" />
    <path d="M5 12h14" />
    <path d="M5 16h14" />
    <path d="M5 20h14" />
  </svg>
)

export const Sidebar = ({ collapsed }: SidebarProps) => {
  const { user } = useAuth()
  const location = useLocation()
  const sidebarWidth = collapsed ? 'w-20' : 'w-64'
  const [isSecurityOpen, setIsSecurityOpen] = useState(false)
  const [isOrganizationOpen, setIsOrganizationOpen] = useState(false)
  const [isClientsOpen, setIsClientsOpen] = useState(false)

  const isLoggedIn = Boolean(user)
  const isAdmin =
    user?.roles?.some((role) => role?.toLowerCase() === 'admin') ?? false
  const isAssistant =
    user?.roles?.some((role) => role?.toLowerCase() === 'assistant') ?? false

  const navigation = [{ to: '/', label: 'Inicio', icon: HomeIcon }]

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
        {
          to: '/organization/departments',
          label: 'Departamentos',
          icon: LocationIcon,
        },
        {
          to: '/organization/municipalities',
          label: 'Municipios',
          icon: LocationIcon,
        },
      ]
    : []

  const clientsNav =
    isLoggedIn && (isAdmin || isAssistant)
      ? [
          {
            to: '/clients',
            label: 'Manejo de clientes',
            icon: ClientsIcon,
          },
          ...(isAdmin
            ? [
                {
                  to: '/clients/catalogs',
                  label: 'Catálogos y actividades',
                  icon: CatalogsIcon,
                },
              ]
            : []),
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

        {clientsNav.length ? (
          <div className="mt-4 space-y-1">
            <button
              type="button"
              onClick={() => setIsClientsOpen((open) => !open)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-slate-700/60 ${
                collapsed ? 'flex-col gap-1 text-center' : 'text-slate-500'
              }`}
            >
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <ClientsIcon className="h-4 w-4" />
                {!collapsed ? 'Clientes' : null}
              </span>
              <ChevronIcon
                className={`h-3 w-3 text-slate-500 transition-transform ${
                  isClientsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            {isClientsOpen
              ? clientsNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={() => {
                      const isActive = location.pathname === item.to
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
