import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Eye, EyeOff, History, MoreHorizontal } from 'lucide-react'
import type { RecentMenuItem } from '@/types/recent-menu'

interface RecentMenusBarProps {
  items: RecentMenuItem[]
  activeItemId?: string | null
  isVisible?: boolean
  onToggleVisibility: () => void
  onSelect: (item: RecentMenuItem) => void
}

const getVisibleRecentCount = (items: RecentMenuItem[], measuredWidth?: number) => {
  if (items.length === 0) return 0

  const viewportWidth = typeof window === 'undefined' ? 1280 : window.innerWidth
  const barWidth = measuredWidth && measuredWidth > 0
    ? measuredWidth
    : Math.min(viewportWidth, 1536)
  const horizontalPadding = viewportWidth < 1024 ? 32 : 64
  const visibilityControlWidth = 30
  const availableWidth = Math.max(0, barWidth - horizontalPadding - visibilityControlWidth)
  const maxItemWidth = viewportWidth < 768 ? 112 : viewportWidth < 1280 ? 144 : 160
  const headerWidth = 68
  const moreControlWidth = 124
  const itemWidth = (label: string) => Math.min(maxItemWidth, Math.max(44, label.length * 5.8 + 12))

  for (let count = items.length; count > 0; count -= 1) {
    const labelsWidth = items
      .slice(0, count)
      .reduce((total, item) => total + itemWidth(item.label), 0)
    const separatorsAndGapsWidth = count * 2 + Math.max(0, count - 1) * 12
    const overflowWidth = count < items.length ? moreControlWidth + 4 : 0
    const requiredWidth = headerWidth + labelsWidth + separatorsAndGapsWidth + overflowWidth

    if (requiredWidth <= availableWidth) return count
  }

  return 1
}

export const RecentMenusBar = ({
  items,
  activeItemId = null,
  isVisible = true,
  onToggleVisibility,
  onSelect,
}: RecentMenusBarProps) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [visibleLimit, setVisibleLimit] = useState(() => getVisibleRecentCount(items))
  const barRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const morePanelRef = useRef<HTMLDivElement>(null)
  const visibleItems = items.slice(0, visibleLimit)
  const overflowItems = items.slice(visibleLimit)

  useEffect(() => {
    if (!isVisible || overflowItems.length === 0) setIsMoreOpen(false)
  }, [isVisible, overflowItems.length])

  useEffect(() => {
    const updateVisibleLimit = () => {
      setVisibleLimit(getVisibleRecentCount(items, barRef.current?.clientWidth))
    }

    updateVisibleLimit()
    window.addEventListener('resize', updateVisibleLimit)
    const observer = typeof ResizeObserver === 'undefined' || !barRef.current
      ? null
      : new ResizeObserver(updateVisibleLimit)
    if (observer && barRef.current) observer.observe(barRef.current)

    return () => {
      window.removeEventListener('resize', updateVisibleLimit)
      observer?.disconnect()
    }
  }, [items])

  useEffect(() => {
    if (!isMoreOpen) return

    const handleMouseDown = (event: MouseEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setIsMoreOpen(false)
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false)
        window.requestAnimationFrame(() => moreButtonRef.current?.focus())
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMoreOpen])

  useEffect(() => {
    if (!isMoreOpen) return
    const focusFrame = window.requestAnimationFrame(() => {
      morePanelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    })
    return () => window.cancelAnimationFrame(focusFrame)
  }, [isMoreOpen])

  if (items.length === 0) return null

  if (!isVisible) {
    return (
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-7 w-full max-w-screen-2xl items-center justify-end px-4 lg:px-8">
          <button
            type="button"
            title="Mostrar menús recientes"
            aria-label="Mostrar menús recientes"
            onClick={onToggleVisibility}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 motion-reduce:transition-none dark:text-slate-500 dark:hover:bg-slate-800/70 dark:hover:text-slate-300"
          >
            <Eye className="h-3 w-3" aria-hidden="true" />
            <span>Mostrar recientes</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div
        ref={barRef}
        className="relative mx-auto flex h-8 w-full max-w-screen-2xl min-w-0 items-center px-4 lg:px-8"
      >
        <nav
          aria-label="Menús recientes"
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden whitespace-nowrap text-[11px]"
        >
          <span className="inline-flex shrink-0 items-center gap-1 pr-1 font-medium text-slate-500 dark:text-slate-400">
            <History className="h-3 w-3" aria-hidden="true" />
            <span>Recientes</span>
          </span>

          {visibleItems.map((item, index) => (
            <span key={item.id} className="inline-flex min-w-0 shrink items-center">
              {index > 0 ? (
                <span className="mx-1 shrink-0 text-slate-300 dark:text-slate-700" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <button
                type="button"
                title={item.label}
                aria-current={activeItemId === item.id ? 'page' : undefined}
                onClick={() => {
                  setIsMoreOpen(false)
                  onSelect(item)
                }}
                className={[
                  'max-w-28 truncate rounded-md px-1.5 py-1 text-left transition focus:outline-none focus:ring-1 focus:ring-primary/40 motion-reduce:transition-none md:max-w-36 xl:max-w-40',
                  activeItemId === item.id
                    ? 'bg-sky-50 font-medium text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200',
                ].join(' ')}
              >
                {item.label}
              </button>
            </span>
          ))}
        </nav>

        {overflowItems.length > 0 ? (
          <div className="relative ml-1 shrink-0">
            <button
              ref={moreButtonRef}
              type="button"
              onClick={() => setIsMoreOpen((open) => !open)}
              className="inline-flex min-h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200"
              aria-label={`Mostrar ${overflowItems.length} accesos recientes más`}
              aria-haspopup="menu"
              aria-expanded={isMoreOpen}
              aria-controls="recent-navigation-overflow"
            >
              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Más recientes</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{overflowItems.length}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform motion-reduce:transition-none ${isMoreOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {isMoreOpen ? (
              <div
                ref={morePanelRef}
                id="recent-navigation-overflow"
                role="menu"
                aria-label="Accesos recientes restantes"
                className="absolute right-0 top-full z-50 mt-1 max-h-80 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-950"
              >
                <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Accesos recientes
                </p>
                {overflowItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    title={item.label}
                    onClick={() => {
                      setIsMoreOpen(false)
                      onSelect(item)
                    }}
                    className={[
                      'flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      activeItemId === item.id
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70',
                    ].join(' ')}
                  >
                    <span className="w-full truncate text-xs font-medium">{item.label}</span>
                    {item.parentLabel ? (
                      <span className="w-full truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {item.parentLabel}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          title="Ocultar menús recientes"
          aria-label="Ocultar menús recientes"
          onClick={() => {
            setIsMoreOpen(false)
            onToggleVisibility()
          }}
          className="ml-2 inline-flex min-h-6 shrink-0 items-center rounded border-l border-slate-200/70 pl-2 text-slate-400 transition hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 motion-reduce:transition-none dark:border-slate-800 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <EyeOff className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
