import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'
import { MenuIcon } from '@/presentation/share/helpers/menu-icon'
import logoLight from '@/assets/logo_light.svg'
import logoDark from '@/assets/logo_dark.svg'
import {
  collectActiveGroups,
  findActiveRootMenu,
  isItemActive,
  isRouteExact,
  sortMenuTree,
} from './menu-tree'

interface SidebarProps {
  collapsed: boolean
  menus: MenuItemTreeDto[]
  isLoadingMenus: boolean
  menusError: string | null
  onRetryMenus: () => void
}

const getSubmenuClasses = (isExpanded: boolean) => {
  return [
    'grid overflow-hidden transition-[grid-template-rows,opacity] duration-150 ease-out',
    isExpanded
      ? 'grid-rows-[1fr] opacity-100'
      : 'grid-rows-[0fr] opacity-0 pointer-events-none',
  ].join(' ')
}

const getSubmenuContentClasses = (isExpanded: boolean, collapsed: boolean) => {
  return [
    'min-h-0 overflow-hidden',
    collapsed
      ? 'ml-1 space-y-1 pl-1'
      : 'ml-2 space-y-1 pl-2',
    isExpanded
      ? collapsed
        ? 'border-l border-slate-200/60 dark:border-slate-700/50'
        : 'rounded-r-lg border-l-2 border-slate-200/80 bg-slate-50/60 py-1 dark:border-slate-700/70 dark:bg-slate-900/25'
      : '',
  ].join(' ')
}

export const Sidebar = ({
  collapsed,
  menus,
  isLoadingMenus,
  menusError,
  onRetryMenus,
}: SidebarProps) => {
  const location = useLocation()
  const sidebarWidth = collapsed ? 'w-20' : 'w-60'
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const sortedMenus = useMemo(() => sortMenuTree(menus), [menus])
  const activeRootMenu = useMemo(
    () => findActiveRootMenu(sortedMenus, location.pathname),
    [location.pathname, sortedMenus],
  )

  useEffect(() => {
    if (!sortedMenus.length) return
    const activeGroups = new Set<string>()
    if (activeRootMenu) {
      collectActiveGroups(activeRootMenu, location.pathname, activeGroups)
    }
    setExpanded((prev) => {
      const next: Record<string, boolean> = { ...prev }
      sortedMenus.forEach((item) => {
        if (item.id !== activeRootMenu?.id) {
          next[item.id] = false
        }
      })
      activeGroups.forEach((id) => {
        next[id] = true
      })
      const prevKeys = Object.keys(prev)
      const nextKeys = Object.keys(next)
      if (prevKeys.length !== nextKeys.length) return next
      const hasDiff = prevKeys.some((key) => prev[key] !== next[key])
      return hasDiff ? next : prev
    })
  }, [activeRootMenu, sortedMenus, location.pathname])

  const toggleGroup = useCallback((id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const baseItemClasses =
    'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white'

  const renderItems = (items: MenuItemTreeDto[], depth: number) => {
    return items.map((item) => {
      const hasChildren = item.children.length > 0
      const isGroup = item.route === null
      const isActive =
        depth === 0
          ? activeRootMenu?.id === item.id
          : isItemActive(item, location.pathname)
      const isExpanded = Boolean(expanded[item.id])
      const collapsedClasses = collapsed ? 'flex-col gap-1.5 px-2 py-2.5 text-[11px]' : ''
      const expandedGroupClasses =
        hasChildren && isExpanded && !isActive
          ? 'bg-slate-50/80 text-slate-700 dark:bg-slate-800/35 dark:text-slate-100'
          : ''
      const isExactActive = isRouteExact(item.route, location.pathname)
      const activeClasses = isActive
        ? "relative bg-slate-200/70 text-slate-900 shadow-sm ring-1 ring-slate-200/70 before:absolute before:left-1 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-sky-500 before:content-[''] dark:bg-slate-700/40 dark:text-slate-100 dark:ring-slate-700/50 dark:before:bg-sky-400"
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
                expandedGroupClasses,
                activeClasses,
              ].join(' ')}
              aria-expanded={hasChildren ? isExpanded : undefined}
            >
              <span className="flex items-center gap-2">
                <MenuIcon iconName={item.icon} className="h-4 w-4 shrink-0" />
                {!collapsed ? <span className="min-w-0 truncate">{item.title}</span> : null}
              </span>
              {hasChildren ? (
                <ChevronIcon
                  className={`h-3 w-3 transition-transform ${
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              ) : null}
            </button>
            {hasChildren ? (
              <div
                className={getSubmenuClasses(isExpanded)}
                aria-hidden={!isExpanded}
              >
                <div className={getSubmenuContentClasses(isExpanded, collapsed)}>
                  {renderItems(item.children, depth + 1)}
                </div>
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
            className={() => {
              const linkActiveClasses = isExactActive
                ? "relative bg-slate-200/70 text-slate-900 shadow-sm ring-1 ring-slate-200/70 before:absolute before:left-1 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-sky-500 before:content-[''] dark:bg-slate-700/40 dark:text-slate-100 dark:ring-slate-700/50 dark:before:bg-sky-400"
                : 'text-slate-600 dark:text-slate-200'
              return [
                baseItemClasses,
                collapsedClasses,
                expandedGroupClasses,
                linkActiveClasses,
              ].join(' ')
            }}
          >
            <MenuIcon iconName={item.icon} className="h-4 w-4 shrink-0" />
            {!collapsed ? <span className="min-w-0 truncate">{item.title}</span> : null}
          </NavLink>
          {hasChildren ? (
            <div
              className={getSubmenuClasses(isExpanded)}
              aria-hidden={!isExpanded}
            >
              <div className={getSubmenuContentClasses(isExpanded, collapsed)}>
                {renderItems(item.children, depth + 1)}
              </div>
            </div>
          ) : null}
        </div>
      )
    })
  }

  return (
    <aside
      className={`fixed inset-y-0 hidden transform overflow-hidden border-r border-slate-300 bg-white text-slate-900 transition-[width] duration-200 dark:border-slate-800 dark:bg-sidebar dark:text-slate-100 lg:flex lg:flex-col ${sidebarWidth}`}
    >
      <NavLink
        to="/"
        className="flex shrink-0 flex-col items-center justify-center px-2.5 py-4 transition-opacity hover:opacity-90"
        aria-label="Ir al inicio"
      >
        <img
          src={logoLight}
          alt="Prestanet"
          className={`${collapsed ? 'h-9' : 'h-10'} w-auto dark:hidden`}
        />
        <img
          src={logoDark}
          alt="Prestanet"
          className={`${collapsed ? 'h-9' : 'h-10'} hidden w-auto dark:block`}
        />
        <span
          className={`mt-1 text-center font-bold uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200 ${
            collapsed ? 'text-[9px]' : 'text-[11px]'
          }`}
        >
          PRESTANET
        </span>
      </NavLink>
      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-2.5 pb-3">
        {isLoadingMenus ? (
          <SidebarSkeleton collapsed={collapsed} />
        ) : menusError ? (
          <SidebarError collapsed={collapsed} error={menusError} onRetry={onRetryMenus} />
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
          className={`flex animate-pulse items-center rounded-md px-2.5 py-1.5 ${
            collapsed ? 'flex-col gap-1.5 px-2 py-2.5' : 'gap-2'
          }`}
        >
          <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
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
