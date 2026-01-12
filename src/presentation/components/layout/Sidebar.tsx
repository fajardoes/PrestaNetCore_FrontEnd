import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'
import { useMyMenus } from '@/presentation/features/security/menus/hooks/use-my-menus'
import { MenuIcon } from '@/presentation/share/helpers/menu-icon'

interface SidebarProps {
  collapsed: boolean
}

const isRouteActive = (route: string | null, pathname: string) => {
  if (!route) return false
  if (route === '/') return pathname === '/'
  return pathname === route || pathname.startsWith(`${route}/`)
}

const isItemActive = (item: MenuItemTreeDto, pathname: string): boolean => {
  if (isRouteActive(item.route, pathname)) return true
  return item.children.some((child) => isItemActive(child, pathname))
}

const sortMenuTree = (items: MenuItemTreeDto[]): MenuItemTreeDto[] => {
  return items
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...item,
      children: sortMenuTree(item.children ?? []),
    }))
}

const collectActiveGroups = (
  item: MenuItemTreeDto,
  pathname: string,
  activeGroups: Set<string>,
): boolean => {
  const childActive = item.children.some((child) =>
    collectActiveGroups(child, pathname, activeGroups),
  )
  if (childActive) {
    activeGroups.add(item.id)
  }
  return isRouteActive(item.route, pathname) || childActive
}

const getIndentClasses = (depth: number, collapsed: boolean) => {
  if (collapsed || depth === 0) return ''
  if (depth === 1) {
    return 'ml-2 border-l border-slate-200 pl-4 dark:border-slate-700/40'
  }
  if (depth === 2) {
    return 'ml-4 border-l border-slate-200 pl-4 dark:border-slate-700/40'
  }
  return 'ml-6 border-l border-slate-200 pl-4 dark:border-slate-700/40'
}

export const Sidebar = ({ collapsed }: SidebarProps) => {
  const { isAuthenticated } = useAuth()
  const { menus, isLoading, error, refetch } = useMyMenus({
    enabled: isAuthenticated,
  })
  const location = useLocation()
  const sidebarWidth = collapsed ? 'w-20' : 'w-64'
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const sortedMenus = useMemo(() => sortMenuTree(menus), [menus])

  useEffect(() => {
    if (!sortedMenus.length) return
    const activeGroups = new Set<string>()
    sortedMenus.forEach((item) => {
      collectActiveGroups(item, location.pathname, activeGroups)
    })
    if (!activeGroups.size) return
    setExpanded((prev) => {
      let changed = false
      const next = { ...prev }
      activeGroups.forEach((id) => {
        if (!next[id]) {
          next[id] = true
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [sortedMenus, location.pathname])

  const toggleGroup = useCallback((id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const baseItemClasses =
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white'

  const renderItems = (items: MenuItemTreeDto[], depth: number) => {
    return items.map((item) => {
      const hasChildren = item.children.length > 0
      const isGroup = item.route === null
      const isActive = isItemActive(item, location.pathname)
      const isExpanded = Boolean(expanded[item.id]) || isActive
      const indentClasses = getIndentClasses(depth, collapsed)
      const collapsedClasses = collapsed ? 'flex-col gap-2 px-2 py-3 text-xs' : ''
      const activeClasses = isActive
        ? 'bg-slate-100 text-slate-900 dark:text-sidebar'
        : 'text-slate-600 dark:text-slate-200'

      if (isGroup) {
        return (
          <div key={item.id} className="space-y-1">
            <button
              type="button"
              title={item.title}
              onClick={hasChildren ? () => toggleGroup(item.id) : undefined}
              className={[
                baseItemClasses,
                collapsedClasses,
                indentClasses,
                activeClasses,
              ].join(' ')}
              aria-expanded={hasChildren ? isExpanded : undefined}
            >
              <span className="flex items-center gap-3">
                <MenuIcon iconName={item.icon} className="h-5 w-5" />
                {!collapsed ? <span>{item.title}</span> : null}
              </span>
              {hasChildren ? (
                <ChevronIcon
                  className={`h-3 w-3 transition-transform ${
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              ) : null}
            </button>
            {hasChildren && isExpanded ? (
              <div className="space-y-1">
                {renderItems(item.children, depth + 1)}
              </div>
            ) : null}
          </div>
        )
      }

      return (
        <div key={item.id} className="space-y-1">
          <NavLink
            to={item.route ?? '/'}
            title={item.title}
            end={item.route === '/'}
            className={({ isActive: linkActive }) => {
              const resolvedActive = linkActive || isActive
              const linkActiveClasses = resolvedActive
                ? 'bg-slate-100 text-slate-900 dark:text-sidebar'
                : 'text-slate-600 dark:text-slate-200'
              return [
                baseItemClasses,
                collapsedClasses,
                indentClasses,
                linkActiveClasses,
              ].join(' ')
            }}
          >
            <MenuIcon iconName={item.icon} className="h-5 w-5" />
            {!collapsed ? <span>{item.title}</span> : null}
          </NavLink>
          {hasChildren ? (
            <div className="space-y-1">
              {renderItems(item.children, depth + 1)}
            </div>
          ) : null}
        </div>
      )
    })
  }

  return (
    <aside
      className={`fixed inset-y-0 hidden transform border-r border-slate-300 bg-white text-slate-900 transition-[width] duration-200 dark:border-slate-800 dark:bg-sidebar dark:text-slate-100 lg:flex lg:flex-col ${sidebarWidth}`}
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
      <nav className="flex-1 space-y-2 px-3">
        {!isAuthenticated ? null : isLoading ? (
          <SidebarSkeleton collapsed={collapsed} />
        ) : error ? (
          <SidebarError collapsed={collapsed} error={error} onRetry={refetch} />
        ) : (
          renderItems(sortedMenus, 0)
        )}
      </nav>
    </aside>
  )
}

const SidebarSkeleton = ({ collapsed }: { collapsed: boolean }) => {
  const items = Array.from({ length: 6 }, (_, index) => index)
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item}
          className={`flex animate-pulse items-center rounded-md px-3 py-2 ${
            collapsed ? 'flex-col gap-2 px-2 py-3' : 'gap-3'
          }`}
        >
          <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700" />
          {!collapsed ? (
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          ) : null}
        </div>
      ))}
    </div>
  )
}

const SidebarError = ({
  collapsed,
  error,
  onRetry,
}: {
  collapsed: boolean
  error: string
  onRetry: () => void
}) => (
  <div
    className={`rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200 ${
      collapsed ? 'text-center' : ''
    }`}
  >
    <p className="mb-2">{error}</p>
    <button
      type="button"
      onClick={onRetry}
      className="w-full rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
    >
      Reintentar
    </button>
  </div>
)

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
