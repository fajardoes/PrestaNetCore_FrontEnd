import { NavLink } from 'react-router-dom'

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

const DashboardIcon = ({ className }: { className?: string }) => (
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
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="4" rx="1" />
    <rect x="14" y="9" width="7" height="12" rx="1" />
    <rect x="3" y="12" width="7" height="9" rx="1" />
  </svg>
)

const navigation = [
  { to: '/', label: 'Inicio', icon: HomeIcon },
  { to: '/about', label: 'Acerca de', icon: InfoIcon },
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
]

export const Sidebar = ({ collapsed }: SidebarProps) => {
  const sidebarWidth = collapsed ? 'w-20' : 'w-64'

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
      </nav>
    </aside>
  )
}
