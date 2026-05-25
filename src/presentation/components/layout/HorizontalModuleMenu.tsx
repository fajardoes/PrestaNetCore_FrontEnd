import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'
import { MenuIcon } from '@/presentation/share/helpers/menu-icon'
import { findActiveRootMenu, isItemActive, isRouteExact, sortMenuTree } from './menu-tree'

interface HorizontalModuleMenuProps {
  menus: MenuItemTreeDto[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export const HorizontalModuleMenu = ({
  menus,
  isLoading,
  error,
  onRetry,
}: HorizontalModuleMenuProps) => {
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  const sortedMenus = useMemo(() => sortMenuTree(menus), [menus])
  const activeRootMenu = useMemo(
    () => findActiveRootMenu(sortedMenus, location.pathname),
    [location.pathname, sortedMenus],
  )
  const moduleItems = activeRootMenu?.children ?? []

  useEffect(() => {
    setOpenGroupId(null)
  }, [location.pathname])

  useEffect(() => {
    if (!openGroupId) return
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target
      const isDropdownClick =
        target instanceof Element &&
        target.closest('[data-horizontal-module-menu-dropdown="true"]')
      if (
        !isDropdownClick &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenGroupId(null)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenGroupId(null)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openGroupId])

  if (isLoading) {
    return (
      <div className="border-b border-slate-200 bg-white/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/90 lg:px-8">
        <div className="flex animate-pulse gap-2 overflow-x-auto">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-9 min-w-28 rounded-lg bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-b border-slate-200 bg-white/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/90 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
          <span>{error}</span>
          {onRetry ? (
            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={onRetry}>
              Reintentar
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  if (!activeRootMenu || !moduleItems.length) return null

  return (
    <div className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div ref={containerRef} className="px-4 py-3 lg:px-8">
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {activeRootMenu.title}
          </p>
        </div>
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
          {moduleItems.map((item) =>
            item.children.length > 0 ? (
              <HorizontalGroupItem
                key={item.id}
                item={item}
                pathname={location.pathname}
                isOpen={openGroupId === item.id}
                onToggle={() =>
                  setOpenGroupId((current) => (current === item.id ? null : item.id))
                }
                onClose={() => setOpenGroupId(null)}
              />
            ) : (
              <HorizontalLinkItem key={item.id} item={item} pathname={location.pathname} />
            ),
          )}
        </div>
      </div>
    </div>
  )
}

const HorizontalLinkItem = ({
  item,
  pathname,
}: {
  item: MenuItemTreeDto
  pathname: string
}) => {
  const isActive = isRouteExact(item.route, pathname)
  return (
    <NavLink
      to={item.route ?? '/'}
      end={item.route === '/'}
      className={[
        'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition whitespace-nowrap',
        isActive
          ? 'border-sky-300 bg-sky-50 text-sky-900 shadow-sm dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800',
      ].join(' ')}
    >
      <MenuIcon iconName={item.icon} className="h-4 w-4" />
      <span>{item.title}</span>
    </NavLink>
  )
}

const HorizontalGroupItem = ({
  item,
  pathname,
  isOpen,
  onToggle,
  onClose,
}: {
  item: MenuItemTreeDto
  pathname: string
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}) => {
  const isActive = isItemActive(item, pathname)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number
    left: number
    minWidth: number
  } | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setDropdownPosition(null)
      return
    }

    const updatePosition = () => {
      const button = buttonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const viewportPadding = 16
      const estimatedDropdownWidth = 240
      const availableLeft = window.innerWidth - estimatedDropdownWidth - viewportPadding
      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.max(viewportPadding, Math.min(rect.left, availableLeft)),
        minWidth: Math.max(rect.width, estimatedDropdownWidth),
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className={[
          'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition whitespace-nowrap',
          isActive
            ? 'border-sky-300 bg-sky-50 text-sky-900 shadow-sm dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800',
        ].join(' ')}
        aria-expanded={isOpen}
      >
        <MenuIcon iconName={item.icon} className="h-4 w-4" />
        <span>{item.title}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && dropdownPosition
        ? createPortal(
            <div
              data-horizontal-module-menu-dropdown="true"
              className="fixed z-50 max-h-[min(28rem,calc(100vh-6rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-950"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                minWidth: dropdownPosition.minWidth,
              }}
            >
              {item.children.map((child) =>
                child.children.length > 0 ? (
                  <div key={child.id} className="py-1">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {child.title}
                    </div>
                    <div className="space-y-1">
                      {child.children.map((grandchild) => (
                        <NavLink
                          key={grandchild.id}
                          to={grandchild.route ?? '/'}
                          end={grandchild.route === '/'}
                          onClick={onClose}
                          className={({ isActive: isCurrent }) =>
                            [
                              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                              isCurrent
                                ? 'bg-sky-50 text-sky-900 dark:bg-sky-500/10 dark:text-sky-100'
                                : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800',
                            ].join(' ')
                          }
                        >
                          <MenuIcon iconName={grandchild.icon} className="h-4 w-4" />
                          <span>{grandchild.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={child.id}
                    to={child.route ?? '/'}
                    end={child.route === '/'}
                    onClick={onClose}
                    className={({ isActive: isCurrent }) =>
                      [
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                        isCurrent
                          ? 'bg-sky-50 text-sky-900 dark:bg-sky-500/10 dark:text-sky-100'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800',
                      ].join(' ')
                    }
                  >
                    <MenuIcon iconName={child.icon} className="h-4 w-4" />
                    <span>{child.title}</span>
                  </NavLink>
                ),
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

const ChevronDownIcon = ({ className }: { className?: string }) => (
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
    <path d="m6 9 6 6 6-6" />
  </svg>
)
