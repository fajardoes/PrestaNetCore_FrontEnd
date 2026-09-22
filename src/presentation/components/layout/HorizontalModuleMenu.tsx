import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'
import { MenuIcon } from '@/presentation/share/helpers/menu-icon'
import { findBestMenuItem, sortMenuTree } from './menu-tree'

interface HorizontalModuleMenuProps {
  menus: MenuItemTreeDto[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

type DropdownPosition = {
  top: number
  left: number
  width: number
  maxHeight: number
}

export const HorizontalModuleMenu = ({
  menus,
  isLoading = false,
  error = null,
  onRetry,
}: HorizontalModuleMenuProps) => {
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const sortedMenus = useMemo(() => sortMenuTree(menus), [menus])
  const activeMenuItemId = useMemo(
    () => findBestMenuItem(sortedMenus, location.pathname)?.id ?? null,
    [location.pathname, sortedMenus],
  )

  useEffect(() => {
    setOpenMenuId(null)
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!openMenuId) return

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target
      const isDropdownClick =
        target instanceof Element &&
        target.closest('[data-top-navigation-dropdown="true"]')

      if (
        !isDropdownClick &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openMenuId])

  useEffect(() => {
    const handleViewportResize = () => {
      if (window.innerWidth < 1280) {
        setOpenMenuId(null)
      } else {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleViewportResize)
    return () => window.removeEventListener('resize', handleViewportResize)
  }, [])

  if (isLoading) {
    return (
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-11 w-full max-w-screen-2xl items-center gap-2 px-4 lg:px-8">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 xl:hidden">
            Cargando menú
          </span>
          <div className="hidden animate-pulse items-center gap-2 motion-reduce:animate-none xl:flex">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-7 rounded-md bg-slate-200 dark:bg-slate-800"
                style={{ width: index === 0 ? 68 : 94 }}
              />
            ))}
          </div>
          <div className="ml-auto h-7 w-24 animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none dark:bg-slate-800 xl:hidden" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900 lg:px-8">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <span>{error}</span>
          {onRetry ? (
            <button type="button" className="btn-secondary btn-list-action" onClick={onRetry}>
              Reintentar
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  if (!sortedMenus.length) return null

  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div ref={containerRef} className="mx-auto w-full max-w-screen-2xl px-4 lg:px-8">
        <nav
          aria-label="Navegación principal"
          className="hidden min-h-11 items-center overflow-x-auto xl:flex"
        >
          <div className="mx-auto flex min-w-max items-center gap-0.5 py-1">
            {sortedMenus.map((item) => (
              <DesktopRootItem
                key={item.id}
                item={item}
                activeMenuItemId={activeMenuItemId}
                isOpen={openMenuId === item.id}
                onToggle={() =>
                  setOpenMenuId((current) => (current === item.id ? null : item.id))
                }
                onClose={() => setOpenMenuId(null)}
              />
            ))}
          </div>
        </nav>

        <div className="flex min-h-11 items-center justify-between gap-3 py-1.5 xl:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Módulos
          </p>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="btn-icon-label rounded-md px-2.5 py-1.5 text-xs"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-primary-navigation"
          >
            <MenuIcon iconName="Menu" className="h-4 w-4" />
            {isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <nav
            id="mobile-primary-navigation"
            aria-label="Menú principal móvil"
            className="border-t border-slate-200 py-2 dark:border-slate-800 xl:hidden"
          >
            <div className="max-h-[calc(100vh-8rem)] space-y-3 overflow-y-auto pb-2">
              {sortedMenus.map((item) => (
                <MobileRootItem
                  key={item.id}
                  item={item}
                  activeMenuItemId={activeMenuItemId}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  )
}

const DesktopRootItem = ({
  item,
  activeMenuItemId,
  isOpen,
  onToggle,
  onClose,
}: {
  item: MenuItemTreeDto
  activeMenuItemId: string | null
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}) => {
  const isActive = containsMenuItem(item, activeMenuItemId)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null)
  const hasChildren = item.children.length > 0
  const dropdownId = `desktop-menu-${item.id}`
  const triggerId = `desktop-menu-trigger-${item.id}`
  const preferredDropdownWidth = 660

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
      const width = Math.min(
        preferredDropdownWidth,
        window.innerWidth - viewportPadding * 2,
      )
      const left = Math.max(
        viewportPadding,
        Math.min(
          rect.left + rect.width / 2 - width / 2,
          window.innerWidth - width - viewportPadding,
        ),
      )
      const top = rect.bottom + 6
      const maxHeight = Math.max(160, window.innerHeight - top - viewportPadding)

      setDropdownPosition({
        top,
        left,
        width,
        maxHeight,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, preferredDropdownWidth])

  useEffect(() => {
    if (!isOpen || !dropdownPosition) return

    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    })

    return () => window.cancelAnimationFrame(focusFrame)
  }, [dropdownPosition, isOpen])

  const closeDropdown = () => {
    onClose()
    window.requestAnimationFrame(() => buttonRef.current?.focus())
  }

  if (!hasChildren) {
    return (
      <NavLink
        to={item.route ?? '/'}
        end={item.route === '/'}
        className={getRootItemClasses(isActive)}
      >
        {item.icon ? <MenuIcon iconName={item.icon} className="h-4 w-4" /> : null}
        <span>{item.title}</span>
      </NavLink>
    )
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            if (!isOpen) onToggle()
          }
        }}
        className={getRootItemClasses(isActive, isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        id={triggerId}
      >
        {item.icon ? <MenuIcon iconName={item.icon} className="h-4 w-4" /> : null}
        <span>{item.title}</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform motion-reduce:transition-none ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && dropdownPosition && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              data-top-navigation-dropdown="true"
              id={dropdownId}
              role="menu"
              aria-labelledby={triggerId}
              aria-label={`Opciones de ${item.title}`}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  closeDropdown()
                }
              }}
              className="fixed z-50 max-h-[calc(100vh-7rem)] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-3 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-950"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                maxHeight: dropdownPosition.maxHeight,
              }}
            >
              <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                {item.title}
              </div>
              <div className="columns-1 gap-x-6 sm:columns-2">
                <DesktopMenuEntries
                  items={item.children}
                  activeMenuItemId={activeMenuItemId}
                  onClose={closeDropdown}
                  depth={0}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

const DesktopMenuEntries = ({
  items,
  activeMenuItemId,
  onClose,
  depth,
}: {
  items: MenuItemTreeDto[]
  activeMenuItemId: string | null
  onClose: () => void
  depth: number
}) => (
  <>
    {items.map((item) => {
      const isCurrent = item.id === activeMenuItemId
      const hasChildren = item.children.length > 0

      if (hasChildren) {
        return (
          <section
            key={item.id}
            className={[
              'break-inside-avoid',
              depth === 0 ? 'pb-3' : 'pt-1 pb-1',
            ].join(' ')}
          >
            <div
              className="px-2 pt-1 pb-1 text-xs font-semibold normal-case text-slate-700 dark:text-slate-200"
            >
              {item.title}
            </div>
            <div className={depth > 0 ? 'space-y-0.5 pl-2' : 'space-y-0.5'}>
              <DesktopMenuEntries
                items={item.children}
                activeMenuItemId={activeMenuItemId}
                onClose={onClose}
                depth={depth + 1}
              />
            </div>
          </section>
        )
      }

      return (
        <NavLink
          key={item.id}
          to={item.route ?? '/'}
          end={item.route === '/'}
          onClick={onClose}
          className={getMenuEntryClasses(isCurrent)}
          role="menuitem"
        >
          {item.icon ? (
            <MenuIcon
              iconName={item.icon}
              className={[
                'h-4 w-4 shrink-0',
                isCurrent
                  ? 'text-sky-600 dark:text-sky-300'
                  : 'text-slate-400 dark:text-slate-500',
              ].join(' ')}
            />
          ) : null}
          <span className="min-w-0 truncate">{item.title}</span>
        </NavLink>
      )
    })}
  </>
)

const MobileRootItem = ({
  item,
  activeMenuItemId,
  onClose,
}: {
  item: MenuItemTreeDto
  activeMenuItemId: string | null
  onClose: () => void
}) => {
  const isActive = containsMenuItem(item, activeMenuItemId)

  if (!item.children.length) {
    return (
      <NavLink
        to={item.route ?? '/'}
        end={item.route === '/'}
        onClick={onClose}
        className={getMobileRootItemClasses(isActive)}
      >
        {item.icon ? <MenuIcon iconName={item.icon} className="h-4 w-4" /> : null}
        <span>{item.title}</span>
      </NavLink>
    )
  }

  return (
    <section>
      <div
        className={[
          'px-2 pb-1 text-xs font-semibold uppercase tracking-[0.08em]',
          isActive ? 'text-sky-700 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400',
        ].join(' ')}
      >
        {item.title}
      </div>
      <div className="space-y-0.5 pl-2">
        <MobileMenuEntries
          items={item.children}
          activeMenuItemId={activeMenuItemId}
          onClose={onClose}
          depth={0}
        />
      </div>
    </section>
  )
}

const MobileMenuEntries = ({
  items,
  activeMenuItemId,
  onClose,
  depth,
}: {
  items: MenuItemTreeDto[]
  activeMenuItemId: string | null
  onClose: () => void
  depth: number
}) => (
  <>
    {items.map((item) => {
      const isActive = item.id === activeMenuItemId

      if (item.children.length > 0) {
        return (
          <section
            key={item.id}
            className={depth > 0 ? 'space-y-0.5 pt-2' : 'space-y-0.5 pt-1'}
          >
            <div className="px-2 py-1 text-xs font-semibold normal-case text-slate-700 dark:text-slate-200">
              {item.title}
            </div>
            <div className="space-y-0.5 pl-2">
              <MobileMenuEntries
                items={item.children}
                activeMenuItemId={activeMenuItemId}
                onClose={onClose}
                depth={depth + 1}
              />
            </div>
          </section>
        )
      }

      return (
        <NavLink
          key={item.id}
          to={item.route ?? '/'}
          end={item.route === '/'}
          onClick={onClose}
          className={getMenuEntryClasses(isActive)}
        >
          {item.icon ? (
            <MenuIcon
              iconName={item.icon}
              className={[
                'h-4 w-4 shrink-0',
                isActive
                  ? 'text-sky-600 dark:text-sky-300'
                  : 'text-slate-400 dark:text-slate-500',
              ].join(' ')}
            />
          ) : null}
          <span className="min-w-0 truncate">{item.title}</span>
        </NavLink>
      )
    })}
  </>
)

const containsMenuItem = (item: MenuItemTreeDto, menuItemId: string | null): boolean => {
  if (!menuItemId) return false
  if (item.id === menuItemId) return true
  return item.children.some((child) => containsMenuItem(child, menuItemId))
}

const getMenuEntryClasses = (isActive: boolean) =>
  [
    'relative flex min-h-9 break-inside-avoid items-center gap-2 rounded-md border-l-2 px-2.5 py-2 text-sm transition motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950',
    isActive
      ? 'border-sky-500 bg-sky-50 font-medium text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
      : 'border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800/70 dark:hover:text-white',
  ].join(' ')

const getRootItemClasses = (isActive: boolean, isOpen = false) =>
  [
    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
    isActive
      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
      : isOpen
        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800/70 dark:text-slate-100'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white',
  ].join(' ')

const getMobileRootItemClasses = (isActive: boolean) =>
  [
    'flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
    isActive
      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70',
  ].join(' ')

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
